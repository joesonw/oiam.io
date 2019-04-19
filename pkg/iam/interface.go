package iam

import (
	"net/url"

	validation "github.com/go-ozzo/ozzo-validation"
)

type Params map[string][]string

func (p Params) AppendParams(params Params) Params {
	for k, v := range params {
		p[k] = append(p[k], v...)
	}
	return p
}

func (p Params) SetParams(params Params) Params {
	for k, v := range params {
		p[k] = v
	}
	return p
}

func (p Params) Has(key string) bool {
	return len(p[key]) != 0
}

func (p Params) Add(key string, values ...string) Params {
	p[key] = append(p[key], values...)
	return p
}

func (p Params) Set(key string, values ...string) Params {
	p[key] = values
	return p
}

func (p Params) AppendValues(values url.Values) Params {
	for k, v := range values {
		p[k] = append(p[k], v...)
	}
	return p
}

func (p Params) SetValues(values url.Values) Params {
	for k, v := range values {
		p[k] = v
	}
	return p
}

func (p Params) Clone() Params {
	params := make(Params)
	for k, values := range p {
		params[k] = make([]string, len(values))
		copy(params[k], values)
	}
	return params
}

type Interface interface {
	validation.Validatable
	GetMetadata() Metadata
	SetMetadata(metadata Metadata)
	GetParams() Params
	SetParams(params Params) Interface
	Clone() Interface
}

type Bare struct {
	Metadata Metadata `json:"metadata,omitempty"`
}

func NewBare(metadata Metadata) Interface {
	return &Bare{Metadata: metadata}
}

func (b Bare) Validate() error {
	return b.Metadata.Validate()
}

func (b Bare) GetMetadata() Metadata {
	return b.Metadata
}

func (b *Bare) SetMetadata(metadata Metadata) {
	b.Metadata = metadata
}

func (b Bare) GetParams() Params {
	return b.Metadata.GetParams()
}

func (b *Bare) SetParams(params Params) Interface {
	return b
}

func (b *Bare) Clone() Interface {
	return &Bare{
		Metadata: b.Metadata,
	}
}
