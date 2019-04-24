package sts

import (
	"time"

	"github.com/joesonw/oiam.io/pkg/iam"
)

type Token struct {
	ID          string    `json:"id,omitempty"`
	Key         string    `json:"key,omitempty"`
	CreatedAt   time.Time `json:"createdAt,omitempty"`
	ExpireAt    time.Time `json:"expireAt,omitempty"`
	SessionName *string   `json:"sessionName,omitempty"`
	AccountRef  iam.Ref   `json:"accountRef,omitempty"`
}
