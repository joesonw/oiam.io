package iam

import validation "github.com/go-ozzo/ozzo-validation"

type PolicyBinding struct {
	Subjects  []Ref    `json:"subjects,omitempty"`
	PolicyRef Ref      `json:"policyRef,omitempty"`
	Metadata  Metadata `json:"metadata,omitempty"`
}

func (pb PolicyBinding) GetMetadata() Metadata {
	return pb.Metadata.WithKind(KindPolicyBinding)
}

func (pb *PolicyBinding) SetMetadata(metadata Metadata) {
	pb.Metadata = metadata
}

func (pb PolicyBinding) GetParams() Params {
	params := pb.Metadata.GetParams().
		AppendParams(pb.PolicyRef.GetParams("policy."))
	for _, subject := range pb.Subjects {
		params = params.AppendParams(subject.GetParams("subject."))
	}
	return params
}

func (pb *PolicyBinding) SetParams(params Params) Interface {
	pb.Subjects = parseParamsToRefs("subject.", params)
	pb.PolicyRef = *pb.PolicyRef.Clone().SetParams("policy.", params)
	return pb
}

func (pb PolicyBinding) Clone() Interface {
	subjects := make([]Ref, len(pb.Subjects))
	for i := range pb.Subjects {
		subjects[i] = *pb.Subjects[i].Clone()
	}
	return &PolicyBinding{
		Subjects:  subjects,
		PolicyRef: pb.PolicyRef,
		Metadata:  *pb.Metadata.Clone(),
	}
}

func (pb PolicyBinding) Validate() error {
	return validation.ValidateStruct(&pb,
		validation.Field(&pb.Subjects, ValidationRefsAreKind(KindAccount, KindGroup, KindRole)),
		validation.Field(&pb.PolicyRef, ValidationRefIsKind(KindPolicy)),
		validation.Field(&pb.Metadata, validation.Required, ValidationMetadataIsKind(KindPolicyBinding)),
	)
}
