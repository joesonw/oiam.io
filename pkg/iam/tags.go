package iam

import "strings"

type Tags map[string]string

func (t Tags) Clone() Tags {
	if t == nil {
		return nil
	}
	tags := make(Tags)
	for k, v := range t {
		tags[k] = v
	}
	return tags
}

func (t Tags) ToParams(prefix ...string) Params {
	p := ""
	if len(prefix) > 0 {
		p = prefix[0]
	}
	params := make(Params)
	for k, v := range t {
		params[p+"tags."+k] = []string{v}
	}
	return params
}

func (t Tags) ParseParams(params Params) {
	for k := range t {
		delete(t, k)
	}
	for k, values := range params {
		if strings.HasPrefix(k, "tags.") {
			t[k[5:]] = strings.Join(values, "")
		}
	}
}

func (t Tags) Add(key, value string) Tags {
	t[key] = value
	return t
}

func (t Tags) Match(o Tags) bool {
	for k := range t {
		if o[k] == "*" {
			continue
		}
		if t[k] != o[k] {
			return false
		}
	}
	return true
}

func (t Tags) Fulfills(o Tags) bool {
	for k := range o {
		if o[k] == "*" {
			continue
		}
		if t[k] != o[k] {
			return false
		}
	}
	return true
}
