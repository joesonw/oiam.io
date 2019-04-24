package storage

import (
	"context"
	"time"

	uuid "github.com/satori/go.uuid"
	"oiam.io/pkg/iam"
)

type Controlled struct {
	in Interface
}

func (c *Controlled) List(ctx context.Context, meta iam.Metadata, params iam.Params, newFunc func() iam.Interface) ([]iam.Interface, error) {
	return c.in.List(ctx, meta, params, newFunc)
}

func (c *Controlled) Get(ctx context.Context, in iam.Interface) error {
	return c.in.Get(ctx, in)
}

func (c *Controlled) Put(ctx context.Context, in iam.Interface) error {
	old := in.Clone()
	err := c.in.Get(ctx, old)
	if err != nil && err != ErrNotFound {
		return err
	}

	newMeta := in.GetMetadata()
	oldMeta := old.GetMetadata().Clone()
	if oldMeta.Version == 0 { // new
		oldMeta.CreatedAt = time.Now()
	}
	oldMeta.Version++
	oldMeta.UID = uuid.NewV4().String()
	oldMeta.UpdatedAt = time.Now()
	oldMeta.Tags = newMeta.Tags
	in.SetMetadata(*oldMeta)
	return c.in.Put(ctx, in)
}

func (c *Controlled) Has(ctx context.Context, kind iam.Kind, namespace, name string) (bool, error) {
	return c.in.Has(ctx, kind, namespace, name)
}

func (c *Controlled) Delete(ctx context.Context, in iam.Interface) error {
	return c.in.Delete(ctx, in)
}
