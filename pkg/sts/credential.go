package sts

import (
	"time"

	"oiam.io/pkg/iam"
)

type Credential struct {
	Key      string      `json:"key,omitempty"`
	Secret   string      `json:"secret,omitempty"`
	Name     string      `json:"name,omitempty"`
	ExpireAt time.Time   `json:"expireAt,omitempty"`
	RoleRef  *iam.Ref    `json:"roleRef,omitempty"`
	Policy   *iam.Policy `json:"policy,omitempty"`
}
