package controller

import (
	"context"
	"errors"

	"github.com/joesonw/oiam.io/pkg/iam"
)

var (
	ErrNotFound = errors.New("not found")
)

type Interface interface {
	Kind() iam.Kind
	New() iam.Interface
	PreFlightCheck(ctx context.Context, in iam.Interface) error
	List(ctx context.Context, meta iam.Metadata, params iam.Params) ([]iam.Interface, error)
	Get(ctx context.Context, meta iam.Metadata) (iam.Interface, error)
	Put(ctx context.Context, in iam.Interface) error
	Delete(ctx context.Context, meta iam.Metadata) error
}
