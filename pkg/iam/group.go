package iam

import (
	validation "github.com/go-ozzo/ozzo-validation"
)

var _ Interface = (*Group)(nil)

type Group struct {
	Description string   `json:"description,omitempty"`
	Metadata    Metadata `json:"metadata,omitempty"`
}

func (g Group) GetMetadata() Metadata {
	return g.Metadata.WithKind(KindGroup)
}
func (g *Group) SetMetadata(metadata Metadata) {
	g.Metadata = metadata
}

func (g Group) GetParams() Params {
	return g.Metadata.GetParams()
}

func (g *Group) SetParams(params Params) Interface {
	g.Metadata.SetParams(params)
	return g
}

func (g Group) Clone() Interface {
	return &Group{
		Description: g.Description,
		Metadata:    *g.Metadata.Clone(),
	}
}

func (g Group) Validate() error {
	return validation.ValidateStruct(&g,
		validation.Field(&g.Metadata, validation.Required, ValidationMetadataIsKind(KindGroup)),
	)
}
