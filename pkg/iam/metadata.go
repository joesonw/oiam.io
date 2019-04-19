package iam

import (
	"fmt"
	"time"

	validation "github.com/go-ozzo/ozzo-validation"
	"oiam.io/pkg/common"
)

type Metadata struct {
	Namespace string     `json:"namespace,omitempty"`
	Tags      Tags       `json:"tags,omitempty"`
	Kind      Kind       `json:"kind,omitempty"`
	Name      string     `json:"name,omitempty"`
	UID       string     `json:"uid,omitempty"`
	Version   int        `json:"version,omitempty"`
	CreatedAt time.Time  `json:"createdAt,omitempty"`
	UpdatedAt time.Time  `json:"updatedAt,omitempty"`
	DeletedAt *time.Time `json:"deletedAt,omitempty"`
}

func NewMetadata(name, namespace string, kind ...Kind) Metadata {
	var k Kind
	if len(kind) > 0 {
		k = kind[0]
	}
	return Metadata{
		Namespace: namespace,
		Name:      name,
		Kind:      k,
	}
}

func (m Metadata) Ref() Ref {
	return Ref{
		Kind:      m.Kind,
		Namespace: m.Namespace,
		Name:      m.Name,
	}
}

func (m Metadata) Clone() *Metadata {
	return &Metadata{
		Namespace: m.Namespace,
		Kind:      m.Kind,
		Tags:      m.Tags.Clone(),
		Name:      m.Name,
		UID:       m.UID,
		Version:   m.Version,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
		DeletedAt: common.CloneTime(m.DeletedAt),
	}
}

func (m Metadata) Validate() error {
	var rules []*validation.FieldRules
	isNamespaceLessKind := false
	for _, kind := range NamespaceLessKinds {
		if kind == m.Kind {
			isNamespaceLessKind = true
			break
		}
	}
	if !isNamespaceLessKind {
		rules = append(rules, validation.Field(&m.Namespace, validation.Required, validation.Length(1, 0)))
	}
	rules = append(rules,
		validation.Field(&m.Kind, validation.Required, validation.Length(1, 0)),
		validation.Field(&m.Name, validation.Required, validation.Length(1, 0)))
	return validation.ValidateStruct(&m, rules...)
}

func (m Metadata) WithKind(kind Kind) Metadata {
	meta := m.Clone()
	meta.Kind = kind
	return *meta
}

func (m Metadata) GetParams() Params {
	params := make(Params)
	return params.AppendParams(m.Tags.ToParams(""))
}

func (m *Metadata) SetParams(params Params) *Metadata {
	if m.Tags == nil {
		m.Tags = make(Tags)
	}
	m.Tags.ParseParams(params)
	return m
}

func (m Metadata) Valid() bool {
	return len(m.UID) > 0
}

func ValidationMetadataIsKind(kinds ...Kind) validation.Rule {
	return validation.By(func(value interface{}) error {
		if len(kinds) == 0 {
			return nil
		}
		in, ok := value.(Metadata)
		if !ok {
			return fmt.Errorf("value %v is not iam.Metadata", value)
		}

		for _, kind := range kinds {
			if kind.String() == in.Kind.String() {
				return nil
			}
		}

		return fmt.Errorf("value %v is not valid iam.Metadata", value)
	})
}
