package controller

import (
	"oiam.io/pkg/iam"
	"oiam.io/pkg/storage"
)

type Namespace struct {
	*withoutNamespaceController
}

func NewNamespace(storageInterface storage.Interface) Interface {
	return &Namespace{
		withoutNamespaceController: withoutNamespace(&basic{
			storage: storageInterface,
			kind:    iam.KindNamespace,
			new:     func() iam.Interface { return &iam.Namespace{} },
		}),
	}
}
