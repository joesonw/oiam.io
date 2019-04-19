package iam

import (
	validation "github.com/go-ozzo/ozzo-validation"
)

type Secret struct {
	Key         string   `json:"key,omitempty"`
	Secret      string   `json:"secret,omitempty"`
	Description string   `json:"description,omitempty"`
	AccountRef  Ref      `json:"accountRef,omitempty"`
	Metadata    Metadata `json:"metadata,omitempty"`
}

func (s Secret) GetMetadata() Metadata {
	return s.Metadata.WithKind(KindSecret)
}

func (s *Secret) SetMetadata(metadata Metadata) {
	s.Metadata = metadata
}

func (s Secret) GetParams() Params {
	return s.Metadata.GetParams().
		Add("key", s.Key).
		AppendParams(s.AccountRef.GetParams("account."))
}

func (s *Secret) SetParams(params Params) Interface {
	s.AccountRef = *s.AccountRef.Clone().SetParams("account.", params)
	if params.Has("key") {
		s.Key = params["key"][0]
	}
	s.Metadata.SetParams(params)
	return s
}

func (s Secret) Clone() Interface {
	return &Secret{
		Description: s.Description,
		Key:         s.Key,
		Secret:      s.Secret,
		AccountRef:  s.AccountRef,
		Metadata:    *s.Metadata.Clone(),
	}
}

func (s Secret) Validate() error {
	return validation.ValidateStruct(&s,
		validation.Field(&s.AccountRef, validation.Required, ValidationRefIsKind(KindAccount)),
		validation.Field(&s.Metadata, validation.Required, ValidationMetadataIsKind(KindSecret)),
	)
}
