package iam

import (
	"fmt"

	validation "github.com/go-ozzo/ozzo-validation"
)

type Kind string

const (
	KindAccount       = "account.v1alpha.oiam.io"
	KindGroup         = "group.v1alpha.oiam.io"
	KindNamespace     = "namespace.v1alpha.oiam.io"
	KindPolicy        = "policy.v1alpha.oiam.io"
	KindRole          = "role.v1alpha.oiam.io"
	KindSecret        = "secret.v1alpha.oiam.io"
	KindPolicyBinding = "policybinding.v1alpha.oiam.io"
	KindGroupBinding  = "groupbinding.v1alpha.oiam.io"
	KindService       = "service.v1alpha.oiam.io"
)

func (k Kind) Equal(o Kind) bool {
	return k == o
}

func (k Kind) String() string {
	return string(k)
}

func (k Kind) Valid() bool {
	for _, kind := range AllKinds {
		if kind.String() == k.String() {
			return true
		}
	}
	return false
}

var AllKinds = []Kind{
	KindAccount,
	KindGroup,
	KindNamespace,
	KindPolicy,
	KindRole,
	KindSecret,
	KindPolicyBinding,
	KindGroupBinding,
	KindService,
}

var NamespaceLessKinds = []Kind{
	KindNamespace,
	KindSecret,
	KindPolicyBinding,
	KindGroupBinding,
}

func ValidationIsTargetKind(kinds ...Kind) validation.Rule {
	return validation.By(func(value interface{}) error {
		in, ok := value.(Kind)
		if !ok {
			return fmt.Errorf("value %v is not iam.Kind", value)
		}

		for _, kind := range kinds {
			if kind.String() == in.String() {
				return nil
			}
		}

		return fmt.Errorf("value %v is not iam.Kind", value)
	})
}

var ValidationIsKind = validation.By(func(value interface{}) error {
	kind, ok := value.(Kind)
	if !ok {
		return fmt.Errorf("value %v is not iam.Kind", value)
	}

	for _, k := range AllKinds {
		if k.String() == kind.String() {
			return nil
		}
	}
	return fmt.Errorf("value %v is not iam.Kind", kind.String())
})
