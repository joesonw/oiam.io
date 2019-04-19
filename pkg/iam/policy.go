package iam

import (
	"errors"
	"fmt"

	validation "github.com/go-ozzo/ozzo-validation"
)

type Policy struct {
	Description string            `json:"description,omitempty"`
	Statements  []PolicyStatement `json:"statements,omitempty"`
	Priority    int               `json:"priority,omitempty"`
	Metadata    Metadata          `json:"metadata,omitempty"`
}

func (p Policy) GetMetadata() Metadata {
	return p.Metadata.WithKind(KindPolicy)
}

func (p *Policy) SetMetadata(metadata Metadata) {
	p.Metadata = metadata
}

func (p Policy) GetParams() Params {
	params := p.Metadata.GetParams()

	for _, statement := range p.Statements {
		params.AppendParams(statement.GetParams())
	}
	return params
}

func (p *Policy) SetParams(params Params) Interface {
	statement := PolicyStatement{}
	p.Statements = []PolicyStatement{*statement.Clone().SetParams(params)}
	return p
}

func (p Policy) Clone() Interface {
	statements := make([]PolicyStatement, len(p.Statements))
	for i := range p.Statements {
		statements[i] = *p.Statements[i].Clone()
	}
	return &Policy{
		Description: p.Description,
		Priority:    p.Priority,
		Statements:  statements,
		Metadata:    *p.Metadata.Clone(),
	}
}

func (p Policy) Validate() error {
	return validation.ValidateStruct(&p,
		validation.Field(&p.Statements),
		validation.Field(&p.Priority, validation.Min(0), validation.Max(100)),
		validation.Field(&p.Metadata, validation.Required, ValidationMetadataIsKind(KindPolicy)),
	)
}

type PolicyStatement struct {
	Description   string                               `json:"description,omitempty"`
	Effect        Effect                               `json:"effect,omitempty"`
	Actions       []string                             `json:"actions,omitempty"`
	NotActions    []string                             `json:"notActions,omitempty"`
	Principals    []Ref                                `json:"principals,omitempty"`
	NotPrincipals []Ref                                `json:"notPrincipals,omitempty"`
	Resources     []Resource                           `json:"resources,omitempty"`
	NotResources  []Resource                           `json:"notResources,omitempty"`
	Priority      int                                  `json:"priority,omitempty"`
	Condition     map[ConditionKey]map[string][]string `json:"condition,omitempty"`
}

func (ps PolicyStatement) GetParams() Params {
	params := make(Params)
	for _, principal := range ps.Principals {
		params = params.AppendParams(principal.GetParams("principals."))
	}
	return params
}

func (ps *PolicyStatement) SetParams(params Params) *PolicyStatement {
	ps.Principals = parseParamsToRefs("principals.", params)
	return ps
}

func (ps PolicyStatement) Clone() *PolicyStatement {
	principals := make([]Ref, len(ps.Principals))
	for i := range ps.Principals {
		principals[i] = *ps.Principals[i].Clone()
	}

	notPrincipals := make([]Ref, len(ps.NotPrincipals))
	for i := range ps.NotPrincipals {
		notPrincipals[i] = *ps.NotPrincipals[i].Clone()
	}

	resources := make([]Resource, len(ps.Resources))
	for i := range ps.Resources {
		resources[i] = *ps.Resources[i].Clone()
	}

	notResources := make([]Resource, len(ps.NotResources))
	for i := range ps.NotResources {
		notResources[i] = *ps.NotResources[i].Clone()
	}

	actions := make([]string, len(ps.Actions))
	copy(actions, ps.Actions)

	notActions := make([]string, len(ps.NotActions))
	copy(notActions, ps.NotActions)

	conditions := make(map[ConditionKey]map[string][]string)
	for key, cond := range conditions {
		c := make(map[string][]string)
		for k, v := range cond {
			c[k] = v
		}
		conditions[key] = c
	}

	return &PolicyStatement{
		Description:   ps.Description,
		Effect:        ps.Effect,
		Priority:      ps.Priority,
		Actions:       actions,
		NotActions:    notActions,
		Principals:    principals,
		NotPrincipals: notPrincipals,
		Resources:     resources,
		NotResources:  notResources,
		Condition:     conditions,
	}
}

func (ps PolicyStatement) Validate() error {
	err := validation.ValidateStruct(&ps,
		validation.Field(&ps.Effect, validation.Required, ValidationIsEffect),
		validation.Field(&ps.Actions, validation.Required, validation.Length(1, 0)),
		validation.Field(&ps.Principals),
		validation.Field(&ps.Resources, validation.Required, validation.Length(1, 0)),
		validation.Field(&ps.Priority, validation.Required, validation.Min(0), validation.Max(100)),
	)
	if err != nil {
		return err
	}

	actionMap := make(map[string]bool)
	for _, a := range ps.Actions {
		if _, ok := actionMap[a]; ok {
			return errors.New("action must be unique")
		}
		actionMap[a] = true
	}

	for _, a := range ps.NotActions {
		if _, ok := actionMap[a]; ok {
			return errors.New("not actions must not overlap")
		}
		actionMap[a] = true
	}

	for key := range ps.Condition {
		if !key.Valid() {
			return fmt.Errorf("condition: ConditionKey '%s' is not valid", key.String())
		}
	}

	return nil
}

type ConditionKey string

const (
	ConditionStringEquals              ConditionKey = "StringEquals"
	ConditionStringNotEquals           ConditionKey = "StringNotEquals"
	ConditionStringEqualsIgnoreCase    ConditionKey = "StringEqualsIgnoreCase"
	ConditionStringNotEqualsIgnoreCase ConditionKey = "StringNotEqualsIgnoreCase"
	ConditionStringLike                ConditionKey = "StringLike"
	ConditionStringNotLike             ConditionKey = "StringNotLike"
	ConditionNumericEquals             ConditionKey = "NumericEquals"
	ConditionNumericNotEquals          ConditionKey = "NumericNotEquals"
	ConditionNumericLessThan           ConditionKey = "NumericLessThan"
	ConditionNumericLessThanEquals     ConditionKey = "NumericLessThanEquals"
	ConditionNumericGreaterThan        ConditionKey = "NumericGreaterThan"
	ConditionNumericGreaterThanEquals  ConditionKey = "NumericGreaterThanEquals"
	ConditionDateEquals                ConditionKey = "DateEquals"
	ConditionDateNotEquals             ConditionKey = "DateNotEquals"
	ConditionDateLessThan              ConditionKey = "DateLessThan"
	ConditionDateLessThanEquals        ConditionKey = "DateLessThanEquals"
	ConditionDateGreaterThan           ConditionKey = "DateGreaterThan"
	ConditionDateGreaterThanEquals     ConditionKey = "DateGreaterThanEquals"
	ConditionBool                      ConditionKey = "Bool"
	ConditionIPAddress                 ConditionKey = "IpAddress"
	ConditionNotIPAddress              ConditionKey = "NotIpAddress"
	ConditionWebhook                   ConditionKey = "Webhook"
)

var ConditionKeyMap = map[ConditionKey]string{
	ConditionStringEquals:              "ConditionStringEquals",
	ConditionStringNotEquals:           "ConditionStringNotEquals",
	ConditionStringEqualsIgnoreCase:    "ConditionStringEqualsIgnoreCase",
	ConditionStringNotEqualsIgnoreCase: "ConditionStringNotEqualsIgnoreCase",
	ConditionStringLike:                "ConditionStringLike",
	ConditionStringNotLike:             "ConditionStringNotLike",
	ConditionNumericEquals:             "ConditionNumericEquals",
	ConditionNumericNotEquals:          "ConditionNumericNotEquals",
	ConditionNumericLessThan:           "ConditionNumericLessThan",
	ConditionNumericLessThanEquals:     "ConditionNumericLessThanEquals",
	ConditionNumericGreaterThan:        "ConditionNumericGreaterThan",
	ConditionNumericGreaterThanEquals:  "ConditionNumericGreaterThanEquals",
	ConditionDateEquals:                "ConditionDateEquals",
	ConditionDateNotEquals:             "ConditionDateNotEquals",
	ConditionDateLessThan:              "ConditionDateLessThan",
	ConditionDateLessThanEquals:        "ConditionDateLessThanEquals",
	ConditionDateGreaterThan:           "ConditionDateGreaterThan",
	ConditionDateGreaterThanEquals:     "ConditionDateGreaterThanEquals",
	ConditionBool:                      "ConditionBool",
	ConditionIPAddress:                 "ConditionIPAddress",
	ConditionNotIPAddress:              "ConditionNotIPAddress",
	ConditionWebhook:                   "ConditionWebhook",
}

var AllConditionKeys = []ConditionKey{
	ConditionStringEquals,
	ConditionStringNotEquals,
	ConditionStringEqualsIgnoreCase,
	ConditionStringNotEqualsIgnoreCase,
	ConditionStringLike,
	ConditionStringNotLike,
	ConditionNumericEquals,
	ConditionNumericNotEquals,
	ConditionNumericLessThan,
	ConditionNumericLessThanEquals,
	ConditionNumericGreaterThan,
	ConditionNumericGreaterThanEquals,
	ConditionDateEquals,
	ConditionDateNotEquals,
	ConditionDateLessThan,
	ConditionDateLessThanEquals,
	ConditionDateGreaterThan,
	ConditionDateGreaterThanEquals,
	ConditionBool,
	ConditionIPAddress,
	ConditionNotIPAddress,
	ConditionWebhook,
}

func (c ConditionKey) String() string {
	return string(c)
}

func (c ConditionKey) Valid() bool {
	for _, k := range AllConditionKeys {
		if k.String() == c.String() {
			return true
		}
	}
	return false
}

type Effect string

const (
	EffectAllow Effect = "Allow"
	EffectDeny  Effect = "Deny"
)

var AllEffects = []Effect{
	EffectAllow,
	EffectDeny,
}

func (e Effect) String() string {
	return string(e)
}

func (e Effect) Valid() bool {
	return e == EffectAllow || e == EffectDeny
}

var ValidationIsEffect = validation.By(func(value interface{}) error {
	effect, ok := value.(Effect)
	if !ok {
		return fmt.Errorf("value %v is not iam.Effect", value)
	}

	for _, k := range AllEffects {
		if k.String() == effect.String() {
			return nil
		}
	}
	return fmt.Errorf("value %v is not iam.Effect", effect.String())
})
