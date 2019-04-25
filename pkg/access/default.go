package access

import (
	"context"
	"errors"
	"regexp"

	"github.com/joesonw/oiam/pkg/common"
	"github.com/joesonw/oiam/pkg/iam"
)

var inLineKeyMatcher = regexp.MustCompile(`\$\{([^\}.]+)\}`)

type DefaultImplementation struct {
	webhookClient *common.WebhookClient
	webhookURL    string
}

func New(config *Config) (Interface, error) {
	in := &DefaultImplementation{}
	if config.ConditionFallback != nil {
		client, err := common.NewWebhookClient(config.ConditionFallback.Timeout)
		if err != nil {
			return nil, err
		}
		in.webhookClient = client
		in.webhookURL = config.ConditionFallback.URL
	}

	return in, nil
}

func checkResource(rule iam.Resource, target iam.Ref) bool {
	if rule.Name != "*" && rule.Name != target.Name {
		return false
	}
	if rule.Namespace != "*" && rule.Namespace != target.Namespace {
		return false
	}
	if rule.Kind != "*" && rule.Kind != target.Kind {
		return false
	}
	if !target.Tags.Fulfills(rule.Tags) {
		return false
	}
	return true
}

func checkPrincipals(principals []iam.Ref, statementPrincipal iam.Ref) bool {
	for _, principal := range principals {
		if statementPrincipal.Kind != "*" && statementPrincipal.Kind != principal.Kind {
			continue
		}
		if statementPrincipal.Name != "*" && statementPrincipal.Name != principal.Name {
			continue
		}
		if statementPrincipal.Namespace != "*" && statementPrincipal.Namespace != principal.Namespace {
			continue
		}
		return true
	}
	return false
}

func (a *DefaultImplementation) Has(ctx context.Context, statements []iam.PolicyStatement, requestAction string, principals []iam.Ref, service iam.Ref) error {
	for _, statement := range statements {
		// check resources
		resourceMatch := false
		for _, resource := range statement.Resources {
			if checkResource(resource, service) {
				resourceMatch = true
				break
			}
		}

		for _, resource := range statement.NotResources {
			if checkResource(resource, service) {
				resourceMatch = false
				break
			}
		}

		if !resourceMatch && statement.Effect == iam.EffectAllow {
			continue
		}

		if resourceMatch && statement.Effect == iam.EffectDeny {
			return errors.New("denied")
		}

		// check actions
		actionMatch := false
		for _, action := range statement.Actions {
			if action == "*" || action == requestAction {
				actionMatch = true
				break
			}
		}

		for _, action := range statement.NotActions {
			if action == "*" || action == requestAction {
				actionMatch = false
				break
			}
		}

		if !actionMatch && statement.Effect == iam.EffectAllow {
			continue
		}

		if actionMatch && statement.Effect == iam.EffectDeny {
			return errors.New("denied")
		}

		// check principals
		principalMatch := false
		if len(statement.Principals) == 0 {
			principalMatch = true
		}

		for _, statementPrincipal := range statement.Principals {
			if checkPrincipals(principals, statementPrincipal) {
				principalMatch = true
				break
			}
		}

		for _, statementPrincipal := range statement.NotPrincipals {
			if checkPrincipals(principals, statementPrincipal) {
				principalMatch = false
				break
			}
		}

		if !principalMatch && statement.Effect == iam.EffectAllow {
			continue
		}

		if principalMatch && statement.Effect == iam.EffectDeny {
			return errors.New("denied")
		}

		// check conditions
		for _, principal := range principals {
			for conditionKey, params := range statement.Condition {
				var validator ConditionValidator
				if conditionKey == iam.ConditionWebhook {
					validator = ConditionWebhookValidator(ctx, a.webhookClient)
				} else {
					validator = conditionValidatorMap[conditionKey]
				}
				if validator == nil {
					continue
				}

				for key, values := range params {
					vals := make([]string, len(values))
					for i, value := range values {
						s := value
						if inLineKeyMatcher.MatchString(s) {
							rPrincipal := principal
							rStatement := statement
							s = inLineKeyMatcher.ReplaceAllStringFunc(s, func(m string) string {
								pkey := m[2 : len(m)-1]
								return a.extractKeyValueFromContext(ctx, pkey, rPrincipal, rStatement, service)
							})
						}
						vals[i] = s
					}

					left := a.extractKeyValueFromContext(ctx, key, principal, statement, service)
					if err := validator.Validate(left, vals); err != nil && statement.Effect == iam.EffectAllow {
						return err
					}
				}
			}
		}

		if statement.Effect == iam.EffectDeny {
			return errors.New("denied")
		}

		return nil
	}

	return errors.New("no matched access rule")
}
