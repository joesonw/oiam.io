package controller

import (
	"context"

	"oiam.io/pkg/iam"
	"oiam.io/pkg/storage"
)

type basic struct {
	storage storage.Interface
	kind    iam.Kind
	new     func() iam.Interface
}

func (c *basic) Kind() iam.Kind {
	return c.kind
}

func (c *basic) New() iam.Interface {
	return c.new()
}

func (c *basic) PreFlightCheck(ctx context.Context, in iam.Interface) error {
	return preFlightCheck(ctx, c.storage, c.kind, in)
}

func (c *basic) List(ctx context.Context, metadata iam.Metadata, params iam.Params) ([]iam.Interface, error) {
	return c.storage.List(ctx, metadata, params, c.new)
}

func (c *basic) Get(ctx context.Context, metadata iam.Metadata) (iam.Interface, error) {
	in := c.new()
	in.SetMetadata(metadata)
	err := c.storage.Get(ctx, in)
	return in, err
}

func (c *basic) Put(ctx context.Context, in iam.Interface) error {
	err := c.storage.Put(ctx, in)
	return err
}

func (c *basic) Delete(ctx context.Context, metadata iam.Metadata) error {
	in, err := c.Get(ctx, metadata)
	if err != nil {
		return err
	}
	return c.storage.Delete(ctx, in)
}
