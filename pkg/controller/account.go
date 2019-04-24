package controller

import (
	"github.com/joesonw/oiam.io/pkg/iam"
	"github.com/joesonw/oiam.io/pkg/storage"
)

type Account struct {
	*basic
}

func NewAccount(storageInterface storage.Interface) Interface {
	return &Account{
		basic: &basic{
			storage: storageInterface,
			kind:    iam.KindAccount,
			new:     func() iam.Interface { return &iam.Account{} },
		},
	}
}
