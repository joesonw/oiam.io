package controller

import (
	"oiam.io/pkg/iam"
	"oiam.io/pkg/storage"
)

type Role struct {
	*basic
}

func NewRole(storageInterface storage.Interface) Interface {
	return &Role{
		basic: &basic{
			storage: storageInterface,
			kind:    iam.KindRole,
			new:     func() iam.Interface { return &iam.Role{} },
		},
	}
}
