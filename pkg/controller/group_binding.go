package controller

import (
	"context"
	"fmt"

	"github.com/joesonw/oiam.io/pkg/iam"
	"github.com/joesonw/oiam.io/pkg/storage"
)

type GroupBinding struct {
	*withoutNamespaceController
}

func NewGroupBinding(storageInterface storage.Interface) Interface {
	return &GroupBinding{
		withoutNamespaceController: withoutNamespace(&basic{
			storage: storageInterface,
			kind:    iam.KindGroupBinding,
			new:     func() iam.Interface { return &iam.GroupBinding{} },
		}),
	}
}

func (c *GroupBinding) PreFlightCheck(ctx context.Context, in iam.Interface) error {
	if err := preFlightCheck(ctx, c.storage, iam.KindGroupBinding, in); err != nil {
		return err
	}

	binding := in.(*iam.GroupBinding)
	for i, subject := range binding.Subjects {
		if err := preFlightCheckRef(ctx, c.storage, fmt.Sprintf("subject%d", i), subject); err != nil {
			return err
		}
	}

	if err := preFlightCheckRef(ctx, c.storage, "groupRef", binding.GroupRef); err != nil {
		return err
	}

	return nil
}
