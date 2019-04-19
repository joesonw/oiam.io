package controller

import (
	"context"
	"errors"
	"fmt"

	"oiam.io/pkg/iam"
	"oiam.io/pkg/storage"
)

func preFlightCheck(ctx context.Context, storageInterface storage.Interface, kind iam.Kind, in iam.Interface) error {
	if err := in.Validate(); err != nil {
		return err
	}

	metadata := in.GetMetadata()
	if metadata.Name == "" {
		return errors.New("metadata name is empty")
	}
	if kind != metadata.Kind {
		return fmt.Errorf("metadata kind '%s' is not '%s'", kind.String(), metadata.Kind.String())
	}

	isNamespaceLessKind := false
	for _, kind := range iam.NamespaceLessKinds {
		if kind == metadata.Kind {
			isNamespaceLessKind = true
			break
		}
	}

	if !isNamespaceLessKind {
		if metadata.Namespace == "" {
			return errors.New("metadata namespace is empty")
		}

		ns := iam.Namespace{
			Metadata: iam.Metadata{
				Kind: iam.KindNamespace,
				Name: metadata.Namespace,
			},
		}

		if err := storageInterface.Get(ctx, &ns); err != nil {
			return fmt.Errorf("cannot get namespace '%s': %s", metadata.Namespace, err.Error())
		}

		if !ns.Metadata.Valid() {
			return fmt.Errorf("namespace '%s' is not found", metadata.Namespace)
		}
	}

	return nil
}

func preFlightCheckRef(ctx context.Context, storageInterface storage.Interface, name string, ref iam.Ref) error {
	if !ref.Kind.Valid() {
		return fmt.Errorf("'%s': kind '%s' is not valid", name, ref.Kind.String())
	}
	if ref.Name == "" || ref.Namespace == "" {
		return fmt.Errorf("'%s' should have namespace and name", name)
	}
	in := ref.Interface()
	if err := storageInterface.Get(ctx, in); err != nil {
		return fmt.Errorf("'%s':%s", name, err.Error())
	}
	if !in.GetMetadata().Valid() {
		return fmt.Errorf("'%s' (%s)%s/%s not found", name, ref.Kind, ref.Namespace, ref.Name)
	}
	return nil
}
