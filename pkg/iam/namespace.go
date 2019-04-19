package iam

import validation "github.com/go-ozzo/ozzo-validation"

type Namespace struct {
	Description string   `json:"description,omitempty"`
	Metadata    Metadata `json:"metadata,omitempty"`
}

func (ns Namespace) GetMetadata() Metadata {
	return ns.Metadata.WithKind(KindNamespace)
}
func (ns *Namespace) SetMetadata(metadata Metadata) {
	ns.Metadata = metadata
}

func (ns Namespace) GetParams() Params {
	return ns.Metadata.GetParams()
}

func (ns *Namespace) SetParams(params Params) Interface {
	ns.Metadata.SetParams(params)
	return ns
}

func (ns Namespace) Clone() Interface {
	return &Namespace{
		Description: ns.Description,
		Metadata:    *ns.Metadata.Clone(),
	}
}

func (ns Namespace) Validate() error {
	return validation.ValidateStruct(&ns,
		validation.Field(&ns.Metadata, validation.Required, ValidationMetadataIsKind(KindNamespace)),
	)
}
