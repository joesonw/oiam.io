package iam

import validation "github.com/go-ozzo/ozzo-validation"

type Role struct {
	Description string   `json:"description,omitempty"`
	Tags        Tags     `json:"tags,omitempty"`
	Metadata    Metadata `json:"metadata,omitempty"`
}

func (r Role) GetMetadata() Metadata {
	return r.Metadata.WithKind(KindRole)
}
func (r *Role) SetMetadata(metadata Metadata) {
	r.Metadata = metadata
}

func (r Role) GetParams() Params {
	return r.Metadata.GetParams().
		AppendParams(r.Tags.ToParams())
}

func (r *Role) SetParams(params Params) Interface {
	r.Tags.ParseParams(params)
	return r
}

func (r Role) Clone() Interface {
	return &Role{
		Description: r.Description,
		Tags:        r.Tags.Clone(),
		Metadata:    *r.Metadata.Clone(),
	}
}

func (r Role) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Metadata, validation.Required, ValidationMetadataIsKind(KindRole)),
	)
}
