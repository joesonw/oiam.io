package iam

import (
	"errors"

	validation "github.com/go-ozzo/ozzo-validation"
)

type CanReference interface {
	Ref() Ref
}

type Ref struct {
	Kind      Kind   `json:"kind,omitempty"`
	Namespace string `json:"namespace,omitempty"`
	Name      string `json:"name,omitempty"`
	Tags      Tags   `json:"tags,omitempty"`
}

func (r Ref) Clone() *Ref {
	return &Ref{
		Kind:      r.Kind,
		Tags:      r.Tags.Clone(),
		Namespace: r.Namespace,
		Name:      r.Name,
	}
}

func (r Ref) Metadata() Metadata {
	return Metadata{
		Kind:      r.Kind,
		Namespace: r.Namespace,
		Name:      r.Name,
	}
}

func (r Ref) Interface() Interface {
	return NewBare(r.Metadata())
}

func (r Ref) GetParams(prefix string) Params {
	return make(Params).
		Add(prefix+"kind", r.Kind.String()).
		Add(prefix+"name", r.Name).
		Add(prefix+"namespace", r.Namespace)
}

func (r *Ref) SetParams(prefix string, params Params) *Ref {
	for k, v := range params {
		switch k {
		case prefix + "kind":
			r.Kind = Kind(v[0])
		case prefix + "name":
			r.Name = v[0]
		case prefix + "namespace":
			r.Namespace = v[0]
		}
	}
	return r
}

func (r Ref) ToTags(prefix string) Tags {
	return Tags(map[string]string{
		prefix + "kind":      r.Kind.String(),
		prefix + "name":      r.Name,
		prefix + "namespace": r.Namespace,
	})
}

func (r Ref) Validate() error {
	return validation.ValidateStruct(&r,
		validation.Field(&r.Namespace, validation.Required),
		validation.Field(&r.Name, validation.Required),
	)
}

func validateRefIsKind(ref Ref, kinds ...Kind) error {
	return validation.ValidateStruct(&ref,
		validation.Field(&ref.Kind, validation.Required, ValidationIsTargetKind(kinds...)),
		validation.Field(&ref.Namespace, validation.Required),
		validation.Field(&ref.Name, validation.Required),
	)
}

func ValidationRefIsKind(kinds ...Kind) validation.Rule {
	return validation.By(func(value interface{}) error {
		ref, ok := value.(Ref)
		if !ok {
			return errors.New("not a ref field")
		}
		return validateRefIsKind(ref, kinds...)
	})
}

func ValidationRefsAreKind(kinds ...Kind) validation.Rule {
	return validation.By(func(value interface{}) error {
		refs, ok := value.([]Ref)
		if !ok {
			return errors.New("not a ref slice field")
		}
		for _, ref := range refs {
			if err := validateRefIsKind(ref, kinds...); err != nil {
				return err
			}
		}
		return nil
	})
}
