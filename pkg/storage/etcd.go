package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"reflect"
	"regexp"
	"strings"

	"github.com/coreos/etcd/mvcc/mvccpb"
	"go.etcd.io/etcd/clientv3"
	"oiam.io/pkg/iam"
)

const (
	asteriskRegexString = `[^:]+`
)

func autoConvertAsterisk(key string) string {
	if key == "*" {
		return asteriskRegexString
	}
	return key
}

func getEtcdID(in iam.Interface) string {
	meta := in.GetMetadata()
	return fmt.Sprintf(`oiam.io/%s:%s:%s`, meta.Namespace, meta.Kind, meta.Name)
}

type ETCD struct {
	client       *clientv3.Client
	constructors map[iam.Kind]func() iam.Interface
	store        map[string]iam.Interface
	paramStore   map[string]map[string]bool
}

func NewETCD(config *ETCDConfig) (*ETCD, error) {
	client, err := clientv3.New(clientv3.Config{
		Endpoints: config.Endpoints,
		Username:  config.Username,
		Password:  config.Password,
	})
	if err != nil {
		return nil, err
	}

	return &ETCD{
		client:       client,
		constructors: make(map[iam.Kind]func() iam.Interface),
		store:        make(map[string]iam.Interface),
		paramStore:   make(map[string]map[string]bool),
	}, nil

}

func (e *ETCD) RegisterConstructor(kind iam.Kind, newFunc func() iam.Interface) {
	e.constructors[kind] = newFunc
}

func (e *ETCD) Start() error {
	ctx := context.TODO()
	resp, err := e.client.Get(ctx, "oiam.io/", clientv3.WithPrefix())
	if err != nil {
		return err
	}

	for _, kv := range resp.Kvs {
		if err := e.parse(kv); err != nil {
			log.Printf("unable to parse '%s'\n", string(kv.Key))
		}
	}

	go e.watch()
	return nil
}

func (e *ETCD) parse(kv *mvccpb.KeyValue) error {
	key := string(kv.Key)
	if !strings.HasPrefix(key, "oiam.io/") {
		return nil
	}
	key = key[8:]
	parts := strings.Split(key, ":") //  kind/
	kind := iam.Kind(parts[1])
	construct := e.constructors[kind]
	if construct == nil {
		return nil
	}

	in := construct()
	err := json.Unmarshal(kv.Value, in)
	if err != nil {
		return err
	}

	e.add(in)
	return nil
}

func (e *ETCD) watch() {
	watcher := clientv3.NewWatcher(e.client)
	watchCh := watcher.Watch(context.TODO(), "oiam.io/", clientv3.WithPrefix())
	for res := range watchCh {
		for _, evt := range res.Events {
			e.remove(string(evt.Kv.Key)[8:])
			if evt.Type == mvccpb.DELETE {
				continue
			}
			if err := e.parse(evt.Kv); err != nil {
				log.Printf("unable to parse '%s'\n", string(evt.Kv.Key))
			}
		}
	}
}

func (e *ETCD) add(in iam.Interface) {
	meta := in.GetMetadata()
	params := in.GetParams()
	id := fmt.Sprintf("%s:%s:%s", meta.Namespace, meta.Kind.String(), meta.Name)
	e.store[id] = in

	for key, values := range params {
		for _, value := range values {
			name := meta.Namespace + ":" + meta.Kind.String() + ":" + key + ":" + value
			if _, ok := e.paramStore[name]; !ok {
				e.paramStore[name] = make(map[string]bool)
			}
			e.paramStore[name][id] = true
		}
	}
}

func (e *ETCD) remove(id string) {
	in := e.store[id]
	delete(e.store, id)
	if in == nil {
		return
	}

	meta := in.GetMetadata()
	params := in.GetParams()

	for key, values := range params {
		for _, value := range values {
			if s, ok := e.paramStore[meta.Namespace+":"+meta.Kind.String()+":"+key+":"+value]; ok {
				println("delete", key, value)
				delete(s, id)
			}
		}
	}
}

func (e *ETCD) List(ctx context.Context, meta iam.Metadata, params iam.Params, newFunc func() iam.Interface) ([]iam.Interface, error) {
	criteriaCount := 0

	for _, values := range params {
		for _, value := range values {
			if value == "" {
				continue
			}
			criteriaCount++
		}
	}

	ns := autoConvertAsterisk(meta.Namespace)
	kind := autoConvertAsterisk(meta.Kind.String())

	var result []iam.Interface
	if criteriaCount == 0 {
		re := regexp.MustCompile(fmt.Sprintf(`%s\:%s\:.+`, ns, kind))
		for id, in := range e.store {
			if re.MatchString(id) {
				result = append(result, in)
			}
		}
	} else {
		keyCountMap := make(map[string]int)
		for key, values := range params {
			keyRe := autoConvertAsterisk(key)
			for _, value := range values {
				if value == "" {
					continue
				}
				valueRe := autoConvertAsterisk(value)
				re := regexp.MustCompile(fmt.Sprintf(`%s\:%s\:%s\:%s`, ns, kind, keyRe, valueRe))
				for keyVal, ids := range e.paramStore {
					if re.MatchString(keyVal) {
						for id := range ids {
							keyCountMap[id]++
						}
					}
				}
			}
		}
		for key, count := range keyCountMap {
			if count != criteriaCount {
				continue
			}
			in := e.store[key]
			if in != nil {
				result = append(result, in)
			}
		}
	}
	return result, nil
}

func (e *ETCD) Get(ctx context.Context, in iam.Interface) error {
	id := getEtcdID(in)[8:]
	result := e.store[id]
	if result == nil {
		return ErrNotFound
	}

	reflect.ValueOf(in).Elem().Set(reflect.ValueOf(result).Elem())
	return nil
}

func (e *ETCD) Put(ctx context.Context, in iam.Interface) error {
	id := getEtcdID(in)
	body, err := json.Marshal(in)
	if err != nil {
		return err
	}
	_, err = e.client.Put(ctx, id, string(body))
	return err
}

func (e *ETCD) Has(ctx context.Context, kind iam.Kind, namespace, name string) (bool, error) {
	id := fmt.Sprintf(`oiam.io/%s:%s:%s`, namespace, kind, name)
	_, ok := e.store[id]
	return ok, nil
}

func (e *ETCD) Delete(ctx context.Context, in iam.Interface) error {
	id := getEtcdID(in)
	_, err := e.client.Delete(ctx, id)
	return err
}
