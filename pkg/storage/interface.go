package storage

import (
	"context"

	"github.com/joesonw/oiam/pkg/iam"
)

type Interface interface {
	List(ctx context.Context, meta iam.Metadata, params iam.Params, newFunc func() iam.Interface) ([]iam.Interface, error)
	Get(ctx context.Context, in iam.Interface) error
	Put(ctx context.Context, in iam.Interface) error
	Has(ctx context.Context, kind iam.Kind, namespace, name string) (bool, error)
	Delete(ctx context.Context, in iam.Interface) error
}
