package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	uuid "github.com/satori/go.uuid"

	"github.com/go-redis/redis"
	"oiam.io/pkg/iam"
)

type Redis struct {
	client *redis.Client
}

func NewRedis(addr, password string, db int) (*Redis, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})
	return &Redis{client}, nil
}

func getRedisKey(in iam.Interface) string {
	meta := in.GetMetadata()
	return fmt.Sprintf("$:%s:%s:%s", meta.Namespace, meta.Kind, meta.Name)
}

func (r *Redis) List(ctx context.Context, meta iam.Metadata, params iam.Params, newFunc func() iam.Interface) ([]iam.Interface, error) {

	pipe := r.client.WithContext(ctx).Pipeline()
	var keyCommands []*redis.StringSliceCmd
	criteriaCount := 0

	for key, values := range params {
		for _, value := range values {
			if value == "" {
				continue
			}
			criteriaCount++
			cmd := pipe.LRange(fmt.Sprintf("!:%s:%s:%s:%s", meta.Namespace, meta.Kind, key, value), 0, -1)
			keyCommands = append(keyCommands, cmd)
		}
	}

	if criteriaCount == 0 { // query all
		cmd := pipe.LRange(fmt.Sprintf("!:%s:%s", meta.Namespace, meta.Kind), 0, -1)
		keyCommands = append(keyCommands, cmd)
	}

	_, err := pipe.Exec()
	if err != nil {
		return nil, err
	}
	pipe.Close()

	var keys []string
	if criteriaCount == 0 {
		keys = keyCommands[0].Val()
	} else {
		keyCountMap := make(map[string]int)
		for _, keyCommand := range keyCommands {
			resultKeys := keyCommand.Val()
			keyExistMap := make(map[string]bool)
			for _, key := range resultKeys {
				if keyExistMap[key] {
					continue
				}
				keyCountMap[key]++
				keyExistMap[key] = true
			}
		}
		for key, count := range keyCountMap {
			if count != criteriaCount {
				continue
			}
			keys = append(keys, key)
		}
	}

	var valueCommands []*redis.StringCmd
	pipe = r.client.WithContext(ctx).Pipeline()
	for _, key := range keys {
		cmd := pipe.Get(key)
		valueCommands = append(valueCommands, cmd)
	}
	_, err = pipe.Exec()
	if err != nil {
		return nil, err
	}
	pipe.Close()

	result := make([]iam.Interface, len(valueCommands))
	for i, valueCommand := range valueCommands {
		result[i] = newFunc()
		err = json.Unmarshal([]byte(valueCommand.Val()), result[i])
		if err != nil {
			return nil, err
		}
	}

	return result, err
}

func (r *Redis) Has(ctx context.Context, kind iam.Kind, namespace, name string) (bool, error) {
	c, err := r.client.WithContext(ctx).Exists(fmt.Sprintf("$:%s:%s:%s", namespace, kind, name)).Result()
	return c == 1, err
}

func (r *Redis) Get(ctx context.Context, in iam.Interface) error {
	v, err := r.client.WithContext(ctx).Get(getRedisKey(in)).Bytes()
	if err != nil {
		return err
	}
	if len(v) == 0 {
		return nil
	}
	return json.Unmarshal(v, in)
}

func (r *Redis) Put(ctx context.Context, in iam.Interface) error {
	resourceKey := getRedisKey(in)
	params := in.GetParams().Clone()

	old := in.Clone()
	err := r.Get(ctx, old)
	if err != nil && err != redis.Nil {
		return err
	}

	oldParams := old.GetParams().Clone()

	meta := old.GetMetadata().Clone()
	if meta.Version == 0 { // new
		meta.CreatedAt = time.Now()
	} else {
		meta.CreatedAt = old.GetMetadata().CreatedAt
	}
	meta.Version++
	meta.UID = uuid.NewV4().String()
	meta.UpdatedAt = time.Now()
	in.SetMetadata(*meta)

	b, _ := json.Marshal(in)

	_, err = r.client.WithContext(ctx).TxPipelined(func(pipe redis.Pipeliner) error {
		pipe.Del(resourceKey)
		pipe.LRem(fmt.Sprintf("!:%s:%s", meta.Namespace, meta.Kind), 0, resourceKey)
		pipe.LRem(fmt.Sprintf("!:%s:%s", "*", meta.Kind), 0, resourceKey)
		for key, values := range oldParams {
			for _, value := range values {
				pipe.LRem(fmt.Sprintf("!:%s:%s:%s:%s", meta.Namespace, meta.Kind, key, value), 0, resourceKey)
				pipe.LRem(fmt.Sprintf("!:%s:%s:%s:%s", "*", meta.Kind, key, value), 0, resourceKey)
			}
		}

		pipe.Set(resourceKey, string(b), 0)
		pipe.LPush(fmt.Sprintf("!:%s:%s", meta.Namespace, meta.Kind), resourceKey)
		pipe.LPush(fmt.Sprintf("!:%s:%s", "*", meta.Kind), resourceKey)
		for key, values := range params {
			for _, value := range values {
				pipe.LPush(fmt.Sprintf("!:%s:%s:%s:%s", meta.Namespace, meta.Kind, key, value), resourceKey)
				pipe.LPush(fmt.Sprintf("!:%s:%s:%s:%s", "*", meta.Kind, key, value), resourceKey)
			}
		}
		return nil
	})
	return err
}

func (r *Redis) Delete(ctx context.Context, in iam.Interface) error {
	meta := in.GetMetadata()
	params := in.GetParams()
	resourceKey := getRedisKey(in)

	_, err := r.client.WithContext(ctx).TxPipelined(func(pipe redis.Pipeliner) error {
		pipe.Del(resourceKey)
		pipe.LRem(fmt.Sprintf("!:%s:%s", meta.Namespace, meta.Kind), 0, resourceKey)
		pipe.LRem(fmt.Sprintf("!:%s:%s", "*", meta.Kind), 0, resourceKey)
		for key, values := range params {
			for _, value := range values {
				pipe.LRem(fmt.Sprintf("!:%s:%s:%s:%s", meta.Namespace, meta.Kind, key, value), 0, resourceKey)
				pipe.LRem(fmt.Sprintf("!:%s:%s:%s:%s", "*", meta.Kind, key, value), 0, resourceKey)
			}
		}
		return nil
	})

	return err
}
