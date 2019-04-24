package main

import (
	"context"
	"fmt"
	"strings"

	"oiam.io/cmd/oiam/app"
	"oiam.io/pkg/access"
	"oiam.io/pkg/common"
	"oiam.io/pkg/controller"
	"oiam.io/pkg/iam"
	"oiam.io/pkg/storage"
	"oiam.io/pkg/sts"
)

func main() {
	config := app.Config{}

	common.ParseConfig(&config)

	storageInstance, err := storage.New(config.Storage)
	if err != nil {
		panic(err)
	}

	defaultAccess, err := access.New(config.Access)
	if err != nil {
		panic(err)
	}

	redisSTS, err := sts.New(config.STS, storageInstance, defaultAccess)

	if err != nil {
		panic(err)
	}

	ctx := context.TODO()
	accounts, err := storageInstance.List(ctx, iam.Metadata{Namespace: "*", Name: "*", Kind: iam.KindAccount}, nil, func() iam.Interface { return &iam.Account{} })
	if err != nil {
		panic(err)
	}
	if len(accounts) == 0 {
		accessKey := common.UUIDHash()
		accessSecret := common.UUIDHash()

		namespace := iam.Namespace{
			Metadata: iam.Metadata{
				Namespace: "",
				Name:      "oiam.io",
				Kind:      iam.KindNamespace,
			},
		}
		if err = namespace.Validate(); err != nil {
			panic(err)
		}
		if err = storageInstance.Put(ctx, &namespace); err != nil {
			panic(err)
		}

		account := iam.Account{
			Description: "default generated admin account",
			Type:        iam.UserAccount,
			Metadata: iam.Metadata{
				Namespace: "oiam.io",
				Name:      "admin",
				Kind:      iam.KindAccount,
				Tags: map[string]string{
					"test": "123",
				},
			},
		}
		if err = account.Validate(); err != nil {
			panic(err)
		}
		if err = storageInstance.Put(ctx, &account); err != nil {
			panic(err)
		}

		group := iam.Group{
			Description: "default generated admin group",
			Metadata: iam.Metadata{
				Namespace: "oiam.io",
				Name:      "admin",
				Kind:      iam.KindGroup,
			},
		}
		if err = group.Validate(); err != nil {
			panic(err)
		}
		if err = storageInstance.Put(ctx, &group); err != nil {
			panic(err)
		}

		role := iam.Role{
			Description: "default generated admin role for temporary assign",
			Metadata: iam.Metadata{
				Namespace: "oiam.io",
				Name:      "admin",
				Kind:      iam.KindRole,
			},
		}
		if err = role.Validate(); err != nil {
			panic(err)
		}
		if err = storageInstance.Put(ctx, &role); err != nil {
			panic(err)
		}

		policy := iam.Policy{
			Description: "default generated admin policy",
			Priority:    100,
			Statements: []iam.PolicyStatement{{
				Description: "admin",
				Effect:      iam.EffectAllow,
				Actions:     []string{"*"},
				Resources: []iam.Resource{{
					Kind:      "*",
					Namespace: "*",
					Name:      "*",
				}},
				Priority: 100,
			}},
			Metadata: iam.Metadata{
				Namespace: "oiam.io",
				Name:      "admin",
				Kind:      iam.KindPolicy,
			},
		}
		if err = policy.Validate(); err != nil {
			panic(err)
		}
		if err = storageInstance.Put(ctx, &policy); err != nil {
			panic(err)
		}

		policyBinding := iam.PolicyBinding{
			PolicyRef: policy.GetMetadata().Ref(),
			Subjects:  []iam.Ref{group.GetMetadata().Ref(), role.GetMetadata().Ref()},
			Metadata: iam.Metadata{
				Name: "admin",
				Kind: iam.KindPolicyBinding,
			},
		}
		if err = policyBinding.Validate(); err != nil {
			panic(err)
		}
		if err = storageInstance.Put(ctx, &policyBinding); err != nil {
			panic(err)
		}

		groupBinding := iam.GroupBinding{
			GroupRef: group.GetMetadata().Ref(),
			Subjects: []iam.Ref{account.GetMetadata().Ref()},
			Metadata: iam.Metadata{
				Name: "admin",
				Kind: iam.KindGroupBinding,
			},
		}
		if err = groupBinding.Validate(); err != nil {
			panic(err)
		}
		if err = storageInstance.Put(ctx, &groupBinding); err != nil {
			panic(err)
		}

		secret := iam.Secret{
			Key:         accessKey,
			Secret:      accessSecret,
			Description: "default generated secret for admin account",
			AccountRef:  account.GetMetadata().Ref(),
			Metadata: iam.Metadata{
				Name: "admin",
				Kind: iam.KindSecret,
			},
		}
		if err = secret.Validate(); err != nil {
			panic(err)
		}
		if err = storageInstance.Put(ctx, &secret); err != nil {
			panic(err)
		}

		fmt.Println(strings.Repeat("*", 40))
		fmt.Println("")
		fmt.Println("    AccessKey:     " + accessKey)
		fmt.Println("    AccessSecret:  " + accessSecret)
		fmt.Println("")
		fmt.Println(strings.Repeat("*", 40))
	}

	// nolint:govet
	srv, err := app.New(redisSTS)
	if err != nil {
		panic(err)
	}
	srv.Register(controller.NewAccount(storageInstance))
	srv.Register(controller.NewRole(storageInstance))
	srv.Register(controller.NewGroup(storageInstance))
	srv.Register(controller.NewPolicy(storageInstance))
	srv.Register(controller.NewGroupBinding(storageInstance))
	srv.Register(controller.NewPolicyBinding(storageInstance))
	srv.Register(controller.NewSecret(storageInstance))
	srv.Register(controller.NewNamespace(storageInstance))

	if err := srv.Start("", config.Port); err != nil {
		panic(err)
	}
}
