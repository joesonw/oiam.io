package storage

import (
	"errors"

	"github.com/joesonw/oiam/pkg/iam"
)

func New(config *Config) (Interface, error) {
	if config.Redis != nil {
		redis, err := NewRedis(config.Redis)
		return &Controlled{in: redis}, err
	} else if config.ETCD != nil {
		etcd, err := NewETCD(config.ETCD)
		if err != nil {
			return nil, err
		}
		etcd.RegisterConstructor(iam.KindAccount, func() iam.Interface { return &iam.Account{} })
		etcd.RegisterConstructor(iam.KindGroup, func() iam.Interface { return &iam.Group{} })
		etcd.RegisterConstructor(iam.KindNamespace, func() iam.Interface { return &iam.Namespace{} })
		etcd.RegisterConstructor(iam.KindPolicy, func() iam.Interface { return &iam.Policy{} })
		etcd.RegisterConstructor(iam.KindRole, func() iam.Interface { return &iam.Role{} })
		etcd.RegisterConstructor(iam.KindSecret, func() iam.Interface { return &iam.Secret{} })
		etcd.RegisterConstructor(iam.KindPolicyBinding, func() iam.Interface { return &iam.PolicyBinding{} })
		etcd.RegisterConstructor(iam.KindGroupBinding, func() iam.Interface { return &iam.GroupBinding{} })
		err = etcd.Start()
		return &Controlled{in: etcd}, err
	}
	return nil, errors.New("no storage provider is configured")
}
