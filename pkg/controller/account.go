package controller

import (
	"oiam.io/pkg/iam"
	"oiam.io/pkg/storage"
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
