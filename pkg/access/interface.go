package access

import (
	"context"

	"github.com/joesonw/oiam.io/pkg/iam"
)

type Interface interface {
	Has(ctx context.Context, statements []iam.PolicyStatement, action string, principals []iam.Ref, service iam.Ref) error
}

type ConditionValidator interface {
	Validate(left string, right []string) error
}

type ConditionValidateFunc func(left string, right []string) error

func (fn ConditionValidateFunc) Validate(left string, right []string) error {
	return fn(left, right)
}
