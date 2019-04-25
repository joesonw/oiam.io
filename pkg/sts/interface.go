package sts

import (
	"context"
	"errors"
	"time"

	"github.com/joesonw/oiam/pkg/iam"
)

type Interface interface {
	Access(ctx context.Context, id string, action string, service iam.Ref) error
	Grant(ctx context.Context, key string, duration time.Duration) (*Token, error)
	Retrieve(ctx context.Context, id string) (*Token, error)
	FindCredential(ctx context.Context, key string) (*Credential, error)
	Assume(ctx context.Context, name string, duration time.Duration, role iam.Ref) (*Credential, error)
}

var (
	ErrUnAuthorized = errors.New("unauthorized")
)
