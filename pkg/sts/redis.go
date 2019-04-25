package sts

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/go-redis/redis"
	"github.com/joesonw/oiam/pkg/access"
	"github.com/joesonw/oiam/pkg/common"
	"github.com/joesonw/oiam/pkg/iam"
	"github.com/joesonw/oiam/pkg/optional"
	"github.com/joesonw/oiam/pkg/storage"
)

type Redis struct {
	redisClient *redis.Client
	storage     storage.Interface
	access      access.Interface
}

func NewRedis(addr, password string, db int, storageInterface storage.Interface, authorizer access.Interface) (*Redis, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})
	return &Redis{
		redisClient: client,
		storage:     storageInterface,
		access:      authorizer,
	}, nil
}

func (sts *Redis) extractStatements(ctx context.Context, token *Token) ([]iam.Ref, []iam.PolicyStatement, error) {
	var statements []iam.PolicyStatement
	principals := []iam.Ref{token.AccountRef}

	if strings.HasPrefix(token.ID, "!STS-") {
		cred, err := sts.findCredentialByName(ctx, *token.SessionName)
		if err != nil {
			return nil, nil, err
		}

		if cred.RoleRef != nil {
			criteria := iam.PolicyBinding{
				Subjects: []iam.Ref{*cred.RoleRef},
				Metadata: iam.Metadata{},
			}
			bindings, err := sts.storage.List(ctx, criteria.GetMetadata(), criteria.GetParams(), func() iam.Interface { return &iam.PolicyBinding{} })
			if err != nil {
				return nil, nil, err
			}

			for _, in := range bindings {
				binding := in.(*iam.PolicyBinding)
				policy := iam.Policy{
					Metadata: iam.Metadata{
						Namespace: binding.PolicyRef.Namespace,
						Name:      binding.PolicyRef.Name,
						Tags:      binding.PolicyRef.Tags,
					},
				}
				err = sts.storage.Get(ctx, &policy)
				if err != nil {
					return nil, nil, err
				}
				statements = append(statements, policy.Statements...)
			}
			principals = append(principals, *cred.RoleRef)
		}

		if cred.Policy != nil {
			statements = append(statements, cred.Policy.Statements...)
		}
	} else {
		var policyBindings []*iam.PolicyBinding

		{
			policyCriteria := iam.PolicyBinding{
				Subjects: []iam.Ref{token.AccountRef},
				Metadata: iam.Metadata{},
			}
			bindings, err := sts.storage.List(ctx, policyCriteria.GetMetadata(), policyCriteria.GetParams(), func() iam.Interface { return &iam.PolicyBinding{} })
			if err != nil {
				return nil, nil, err
			}

			for _, in := range bindings {
				binding := in.(*iam.PolicyBinding)
				policyBindings = append(policyBindings, binding)
			}
		}

		groupCriteria := iam.GroupBinding{
			Subjects: []iam.Ref{token.AccountRef},
			Metadata: iam.Metadata{},
		}

		groups, err := sts.storage.List(ctx, groupCriteria.GetMetadata(), groupCriteria.GetParams(), func() iam.Interface { return &iam.GroupBinding{} })
		if err != nil {
			return nil, nil, err
		}

		for _, in := range groups {
			group := in.(*iam.GroupBinding)
			principals = append(principals, group.GroupRef)
			policyCriteria := iam.PolicyBinding{
				Subjects: []iam.Ref{group.GroupRef},
				Metadata: iam.Metadata{},
			}
			// nolint:govet
			bindings, err := sts.storage.List(ctx, policyCriteria.GetMetadata(), policyCriteria.GetParams(), func() iam.Interface { return &iam.PolicyBinding{} })
			if err != nil {
				return nil, nil, err
			}

			for _, in := range bindings {
				binding := in.(*iam.PolicyBinding)
				policyBindings = append(policyBindings, binding)
			}

		}

		if err != nil {
			return nil, nil, err
		}

		for _, binding := range policyBindings {
			policy := iam.Policy{
				Metadata: iam.Metadata{
					Namespace: binding.PolicyRef.Namespace,
					Name:      binding.PolicyRef.Name,
					Tags:      binding.PolicyRef.Tags,
				},
			}
			err = sts.storage.Get(ctx, &policy)
			if err != nil {
				return nil, nil, err
			}
			statements = append(statements, policy.Statements...)
		}

	}

	return principals, statements, nil
}

func (sts *Redis) Access(ctx context.Context, id, action string, service iam.Ref) error {
	token, err := sts.Retrieve(ctx, id)
	if err != nil {
		return err
	}

	principals, statements, err := sts.extractStatements(ctx, token)
	if err != nil {
		return err
	}
	return sts.access.Has(ctx, statements, action, principals, service)
}

func (sts *Redis) FindCredential(ctx context.Context, key string) (*Credential, error) {
	if strings.HasPrefix(key, "!STS-") {
		keys, err := sts.redisClient.WithContext(ctx).Keys(fmt.Sprintf("@:secret:*:%s", key)).Result()
		if err != nil {
			return nil, err
		}

		if len(keys) == 0 {
			return nil, ErrUnAuthorized
		}

		credentialBytes, err := sts.redisClient.WithContext(ctx).Get(keys[0]).Bytes()
		if err != nil {
			println("here")
			return nil, err
		}

		credential := &Credential{}
		err = json.Unmarshal(credentialBytes, credential)
		return credential, err
	}
	secret := iam.Secret{
		Key: key,
	}
	secrets, err := sts.storage.List(ctx, secret.GetMetadata(), secret.GetParams(), func() iam.Interface { return &iam.Secret{} })
	if err != nil {
		return nil, err
	}
	if len(secrets) == 0 {
		return nil, ErrUnAuthorized
	}
	secret = *(secrets[0].(*iam.Secret))
	return &Credential{
		Key:    secret.Key,
		Secret: secret.Secret,
	}, nil
}

func (sts *Redis) findCredentialByName(ctx context.Context, name string) (*Credential, error) {
	keys, err := sts.redisClient.WithContext(ctx).Keys(fmt.Sprintf("@:secret:%s:*", name)).Result()
	if err != nil {
		return nil, err
	}

	if len(keys) == 0 {
		return nil, ErrUnAuthorized
	}

	credentialBytes, err := sts.redisClient.WithContext(ctx).Get(keys[0]).Bytes()
	if err != nil {
		return nil, err
	}
	credential := &Credential{}
	err = json.Unmarshal(credentialBytes, credential)
	return credential, err
}

func (sts *Redis) Retrieve(ctx context.Context, id string) (*Token, error) {
	tokenBytes, err := sts.redisClient.WithContext(ctx).Get(fmt.Sprintf("@:token:%s", id)).Bytes()
	if err != nil {
		return nil, err
	}
	token := &Token{}
	err = json.Unmarshal(tokenBytes, token)
	return token, err
}

func (sts *Redis) Grant(ctx context.Context, key string, duration time.Duration) (*Token, error) {
	isSTSCredential := strings.HasPrefix(key, "!STS-")
	token := &Token{
		ID:        common.UUIDHash(),
		CreatedAt: time.Now(),
	}

	if isSTSCredential {
		credential, err := sts.FindCredential(ctx, key)
		if err != nil {
			return nil, err
		}
		token.AccountRef = iam.Ref{
			Kind: iam.KindAccount,
			Name: credential.Name,
			Tags: make(iam.Tags).Add("v1alpha.sts.oiam.io/isSTS", "true"),
		}
		token.SessionName = optional.String(credential.Name)
		token.ID = "!STS-" + token.ID
		token.Key = credential.Key
		duration = time.Until(credential.ExpireAt)
	} else {
		meta := iam.Metadata{
			Kind: iam.KindSecret,
		}
		secrets, err := sts.storage.List(ctx, meta, make(iam.Params).Add("key", key), func() iam.Interface { return &iam.Secret{} })
		if err != nil {
			return nil, err
		}
		if len(secrets) == 0 {
			return nil, ErrUnAuthorized
		}
		token.AccountRef = secrets[0].(*iam.Secret).AccountRef
		token.Key = secrets[0].(*iam.Secret).Key
	}

	token.ExpireAt = time.Now().Add(duration)
	tokenBytes, err := json.Marshal(token)
	if err != nil {
		return nil, err
	}
	err = sts.redisClient.WithContext(ctx).Set(fmt.Sprintf("@:token:%s", token.ID), tokenBytes, duration).Err()
	return token, err
}

func (sts *Redis) Assume(ctx context.Context, name string, duration time.Duration, roleRef iam.Ref) (*Credential, error) {
	credential := &Credential{
		Key:      "!STS-" + common.UUIDHash(),
		Secret:   common.UUIDHash(),
		Name:     name,
		ExpireAt: time.Now().Add(duration),
		RoleRef:  roleRef.Clone(),
	}

	credentialBytes, err := json.Marshal(credential)
	if err != nil {
		return nil, err
	}
	keys, err := sts.redisClient.Keys(fmt.Sprintf("@:secret:%s:*", name)).Result()
	if err != nil {
		return nil, err
	}

	_, err = sts.redisClient.WithContext(ctx).TxPipelined(func(pipe redis.Pipeliner) error {
		if len(keys) > 0 {
			err = pipe.Del(keys...).Err()
			if err != nil {
				return err
			}
		}

		return pipe.Set(fmt.Sprintf("@:secret:%s:%s", name, credential.Key), credentialBytes, duration).Err()
	})

	return credential, err
}
