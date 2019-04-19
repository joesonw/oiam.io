package iam

import (
	validation "github.com/go-ozzo/ozzo-validation"
)

type AccountType string

const (
	UserAccount    AccountType = "user"
	ServiceAccount AccountType = "service"
)

func (typ AccountType) String() string {
	return string(typ)
}

type Account struct {
	Description string      `json:"description,omitempty"`
	Type        AccountType `json:"type,omitempty"`
	Metadata    Metadata    `json:"metadata,omitempty"`
}

func (a Account) GetMetadata() Metadata {
	return a.Metadata.WithKind(KindAccount)
}

func (a *Account) SetMetadata(metadata Metadata) {
	a.Metadata = metadata
}

func (a Account) GetParams() Params {
	return a.Metadata.GetParams().
		Add("type", a.Type.String())
}

func (a *Account) SetParams(params Params) Interface {
	for k, v := range params {
		if k == "type" {
			a.Type = AccountType(v[0])
		}
	}
	a.Metadata.SetParams(params)
	return a
}

func (a Account) Clone() Interface {
	return &Account{
		Description: a.Description,
		Type:        a.Type,
		Metadata:    *a.Metadata.Clone(),
	}
}

func (a Account) Validate() error {
	return validation.ValidateStruct(&a,
		validation.Field(&a.Type, validation.Required, validation.In(UserAccount, ServiceAccount)),
		validation.Field(&a.Metadata, validation.Required, ValidationMetadataIsKind(KindAccount)),
	)
}
