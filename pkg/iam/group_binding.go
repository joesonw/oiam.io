package iam

import (
	validation "github.com/go-ozzo/ozzo-validation"
)

type GroupBinding struct {
	Subjects []Ref    `json:"subjects,omitempty"`
	GroupRef Ref      `json:"groupRef,omitempty"`
	Metadata Metadata `json:"metadata,omitempty"`
}

func (gb GroupBinding) GetMetadata() Metadata {
	return gb.Metadata.WithKind(KindGroupBinding)
}

func (gb *GroupBinding) SetMetadata(metadata Metadata) {
	gb.Metadata = metadata
}

func (gb GroupBinding) GetParams() Params {
	params := gb.Metadata.GetParams().
		AppendParams(gb.GroupRef.GetParams("group."))
	for _, subject := range gb.Subjects {
		params = params.AppendParams(subject.GetParams("subject."))
	}
	return params
}

func (gb *GroupBinding) SetParams(params Params) Interface {
	gb.Subjects = parseParamsToRefs("subject.", params)
	gb.GroupRef = *gb.GroupRef.Clone().SetParams("group.", params)
	return gb
}

func (gb GroupBinding) Clone() Interface {
	subjects := make([]Ref, len(gb.Subjects))
	for i := range gb.Subjects {
		subjects[i] = *gb.Subjects[i].Clone()
	}
	return &GroupBinding{
		Subjects: subjects,
		GroupRef: gb.GroupRef,
		Metadata: *gb.Metadata.Clone(),
	}
}

func (gb GroupBinding) Validate() error {
	return validation.ValidateStruct(&gb,
		validation.Field(&gb.Subjects, ValidationRefsAreKind(KindAccount)),
		validation.Field(&gb.GroupRef, ValidationRefIsKind(KindGroup)),
		validation.Field(&gb.Metadata, validation.Required, ValidationMetadataIsKind(KindGroupBinding)),
	)
}
