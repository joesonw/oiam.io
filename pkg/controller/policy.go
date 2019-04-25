package controller

import (
	"github.com/joesonw/oiam/pkg/iam"
	"github.com/joesonw/oiam/pkg/storage"
)

type Policy struct {
	*basic
}

func NewPolicy(storageInterface storage.Interface) Interface {
	return &Policy{
		basic: &basic{
			storage: storageInterface,
			kind:    iam.KindPolicy,
			new:     func() iam.Interface { return &iam.Policy{} },
		},
	}
}
