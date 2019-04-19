package controller

import (
	"oiam.io/pkg/iam"
	"oiam.io/pkg/storage"
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
