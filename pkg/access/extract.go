package access

import (
	"context"
	"fmt"
	"strings"
	"time"

	"oiam.io/pkg/common"
	"oiam.io/pkg/iam"
)

type KeyValueExtractRequest struct {
	Key       string              `json:"key,omitempty"`
	Principal iam.Ref             `json:"principal,omitempty"`
	Service   iam.Ref             `json:"resource,omitempty"`
	Statement iam.PolicyStatement `json:"statement,omitempty"`
}

type KeyValueExtractResponse struct {
	Value string `json:"value,omitempty"`
}

func (a *DefaultImplementation) extractKeyValueFromContext(ctx context.Context, key string, principal iam.Ref, statement iam.PolicyStatement, service iam.Ref) string {
	switch key {
	case "v1alpha.conditionkeys.oiam.io/PrincipalKind":
		return principal.Kind.String()
	case "v1alpha.conditionkeys.oiam.io/PrincipalNamespace":
		return principal.Namespace
	case "v1alpha.conditionkeys.oiam.io/PrincipalName":
		return principal.Name
	case "v1alpha.conditionkeys.oiam.io/ResourceKind":
		return service.Kind.String()
	case "v1alpha.conditionkeys.oiam.io/ResourceNamespace":
		return service.Namespace
	case "v1alpha.conditionkeys.oiam.io/ResourceName":
		return service.Name
	case "v1alpha.conditionkeys.oiam.io/CurrentTime":
		return common.StringTime(time.Now())
	case "v1alpha.conditionkeys.oiam.io/EpochTime":
		return fmt.Sprintf("%d", time.Now().Unix())
	}

	if strings.HasPrefix(key, "v1alpha.conditionkeys.oiam.io/PrincipalTag/") {
		return principal.Tags[key[43:]]
	}

	if strings.HasPrefix(key, "v1alpha.conditionkeys.oiam.io/ResourceTag/") {
		return service.Tags[key[42:]]
	}

	if strings.HasPrefix(key, "v1alpha.conditionkeys.oiam.io/Header/") {
		return common.GetHeaderFromContext(ctx, key[37:])
	}

	if a.webhookURL != "" {
		req := KeyValueExtractRequest{
			Key:       key,
			Principal: principal,
			Service:   service,
			Statement: statement,
		}
		res := KeyValueExtractResponse{}
		err := a.webhookClient.Do(ctx, a.webhookURL, "authorization.oiam.io/extract-key-value", &req, &res)
		if err != nil {
			return ""
		}
		return res.Value
	}
	return ""
}
