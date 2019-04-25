package controller

import (
	"context"

	"github.com/joesonw/oiam/pkg/common"
	"github.com/joesonw/oiam/pkg/iam"
	"github.com/joesonw/oiam/pkg/storage"
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
