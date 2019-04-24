package controller

import (
	"context"
	"fmt"

	"github.com/joesonw/oiam.io/pkg/iam"
	"github.com/joesonw/oiam.io/pkg/storage"
)

type PolicyBinding struct {
	*withoutNamespaceController
}

func NewPolicyBinding(storageInterface storage.Interface) Interface {
	return &PolicyBinding{
		withoutNamespaceController: withoutNamespace(&basic{
			storage: storageInterface,
			kind:    iam.KindPolicyBinding,
			new:     func() iam.Interface { return &iam.PolicyBinding{} },
		}),
	}
}

func (c *PolicyBinding) PreFlightCheck(ctx context.Context, in iam.Interface) error {
	if err := preFlightCheck(ctx, c.storage, iam.KindPolicyBinding, in); err != nil {
		return err
	}
	binding := in.(*iam.PolicyBinding)
	for i, subject := range binding.Subjects {
		if err := preFlightCheckRef(ctx, c.storage, fmt.Sprintf("subject%d", i), subject); err != nil {
			return err
		}
	}

	if err := preFlightCheckRef(ctx, c.storage, "policyRef", binding.PolicyRef); err != nil {
		return err
	}

	return nil
}
