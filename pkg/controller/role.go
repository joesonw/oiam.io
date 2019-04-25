package controller

import (
	"github.com/joesonw/oiam/pkg/iam"
	"github.com/joesonw/oiam/pkg/storage"
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
