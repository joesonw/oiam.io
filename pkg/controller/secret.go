package controller

import (
	"context"

	"oiam.io/pkg/common"
	"oiam.io/pkg/iam"
	"oiam.io/pkg/storage"
)

type Secret struct {
	*withoutNamespaceController
}

func NewSecret(storageInterface storage.Interface) Interface {
	return &Secret{
		withoutNamespaceController: withoutNamespace(&basic{
			storage: storageInterface,
			kind:    iam.KindSecret,
			new:     func() iam.Interface { return &iam.Secret{} },
		}),
	}
}

func (c *Secret) Put(ctx context.Context, in iam.Interface) error {
	secret := in.(*iam.Secret)
	secret.Key = common.UUIDHash()
	secret.Secret = common.UUIDHash()
	return c.withoutNamespaceController.Put(ctx, secret)
}
