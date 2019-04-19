package controller

import (
	"oiam.io/pkg/iam"
	"oiam.io/pkg/storage"
)

type Group struct {
	*basic
}

func NewGroup(storageInterface storage.Interface) Interface {
	return &Group{
		basic: &basic{
			storage: storageInterface,
			kind:    iam.KindGroup,
			new:     func() iam.Interface { return &iam.Group{} },
		},
	}
}
