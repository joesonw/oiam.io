package controller

import (
	"context"

	"github.com/joesonw/oiam.io/pkg/iam"
)

type withoutNamespaceController struct {
	*basic
}

func withoutNamespace(basic *basic) *withoutNamespaceController {
	return &withoutNamespaceController{basic: basic}
}

func (c *withoutNamespaceController) List(ctx context.Context, metadata iam.Metadata, params iam.Params) ([]iam.Interface, error) {
	meta := metadata.Clone()
	return c.storage.List(ctx, *meta, params, c.new)
}

func (c *withoutNamespaceController) Get(ctx context.Context, metadata iam.Metadata) (iam.Interface, error) {
	meta := metadata.Clone()
	meta.Namespace = ""
	in := &iam.Namespace{
		Metadata: *meta,
	}
	err := c.storage.Get(ctx, in)
	return in, err
}

func (c *withoutNamespaceController) Put(ctx context.Context, in iam.Interface) error {
	meta := in.GetMetadata().Clone()
	meta.Namespace = ""
	in.SetMetadata(*meta)
	err := c.storage.Put(ctx, in)
	return err
}

func (c *withoutNamespaceController) Delete(ctx context.Context, metadata iam.Metadata) error {
	meta := metadata.Clone()
	meta.Namespace = ""
	in, err := c.Get(ctx, *meta)
	if err != nil {
		return err
	}
	return c.storage.Delete(ctx, in)
}
