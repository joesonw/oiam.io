package controller

import (
	"github.com/joesonw/oiam/pkg/iam"
	"github.com/joesonw/oiam/pkg/storage"
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
