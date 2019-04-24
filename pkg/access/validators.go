package access

import (
	"context"
	"fmt"
	"net"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/joesonw/oiam.io/pkg/common"
	"github.com/joesonw/oiam.io/pkg/iam"
)

const (
	BoolFalse = "false"
	BoolTrue  = "true"
)

var conditionValidatorMap = map[iam.ConditionKey]ConditionValidator{
	iam.ConditionStringEquals:              ConditionStringEqualsValidator,
	iam.ConditionStringNotEquals:           ConditionStringNotEqualsValidator,
	iam.ConditionStringEqualsIgnoreCase:    ConditionStringEqualsIgnoreCaseValidator,
	iam.ConditionStringNotEqualsIgnoreCase: ConditionStringNotEqualsIgnoreCaseValidator,
	iam.ConditionStringLike:                ConditionStringLikeValidator,
	iam.ConditionStringNotLike:             ConditionStringNotLikeValidator,
	iam.ConditionNumericEquals:             ConditionNumericEqualsValidator,
	iam.ConditionNumericNotEquals:          ConditionNumericNotEqualsValidator,
	iam.ConditionNumericLessThan:           ConditionNumericLessThanValidator,
	iam.ConditionNumericLessThanEquals:     ConditionNumericLessThanEqualsValidator,
	iam.ConditionNumericGreaterThan:        ConditionNumericGreaterThanValidator,
	iam.ConditionNumericGreaterThanEquals:  ConditionNumericGreaterThanEqualsValidator,
	iam.ConditionDateEquals:                ConditionDateEqualsValidator,
	iam.ConditionDateNotEquals:             ConditionDateNotEqualsValidator,
	iam.ConditionDateLessThan:              ConditionDateLessThanValidator,
	iam.ConditionDateLessThanEquals:        ConditionDateLessThanEqualsValidator,
	iam.ConditionDateGreaterThan:           ConditionDateGreaterThanValidator,
	iam.ConditionDateGreaterThanEquals:     ConditionDateGreaterThanEqualsValidator,
	iam.ConditionBool:                      ConditionBoolValidator,
	iam.ConditionIPAddress:                 ConditionIPAddressValidator,
	iam.ConditionNotIPAddress:              ConditionNotIPAddressValidator,
}

var ConditionStringEqualsValidator = ConditionValidateFunc(func(left string, right []string) error {
	for _, c := range right {
		if left == c {
			return nil
		}
	}
	return fmt.Errorf("condition: ConditionStringEquals faield")
})

var ConditionStringNotEqualsValidator = ConditionValidateFunc(func(left string, right []string) error {
	for _, c := range right {
		if left == c {
			return fmt.Errorf("condition: ConditionStringNotEquals faield")
		}
	}
	return nil
})

var ConditionStringEqualsIgnoreCaseValidator = ConditionValidateFunc(func(left string, right []string) error {
	for _, c := range right {
		if strings.EqualFold(left, c) {
			return nil
		}
	}
	return fmt.Errorf("condition: ConditionStringEqualsIgnoreCase faield")
})

var ConditionStringNotEqualsIgnoreCaseValidator = ConditionValidateFunc(func(left string, right []string) error {
	for _, c := range right {
		if strings.EqualFold(left, c) {
			return fmt.Errorf("condition: ConditionStringNotEqualsIgnoreCase faield")
		}
	}
	return nil
})

var ConditionStringLikeValidator = ConditionValidateFunc(func(left string, right []string) error {
	for _, c := range right {
		re, err := regexp.Compile(c)
		if err != nil {
			return err
		}
		if re.MatchString(left) {
			return nil
		}
	}
	return fmt.Errorf("condition: ConditionStringLike faield")
})

var ConditionStringNotLikeValidator = ConditionValidateFunc(func(left string, right []string) error {
	for _, c := range right {
		re, err := regexp.Compile(c)
		if err != nil {
			return err
		}
		if re.MatchString(left) {
			return fmt.Errorf("condition: ConditionStringNotLike faield")
		}
	}
	return nil
})

var ConditionNumericEqualsValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := strconv.ParseFloat(left, 64)
	if err != nil {
		return err
	}

	for _, c := range right {
		val, err := strconv.ParseFloat(c, 64)
		if err != nil {
			return err
		}
		if leftVal == val {
			return nil
		}
	}
	return fmt.Errorf("condition: ConditionNumericEquals faield")
})

var ConditionNumericNotEqualsValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := strconv.ParseFloat(left, 64)
	if err != nil {
		return err
	}

	for _, c := range right {
		val, err := strconv.ParseFloat(c, 64)
		if err != nil {
			return err
		}
		if leftVal == val {
			return fmt.Errorf("condition: ConditionNumericNotEquals faield")
		}
	}
	return nil
})

var ConditionNumericLessThanValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := strconv.ParseFloat(left, 64)
	if err != nil {
		return err
	}

	rightVal, err := strconv.ParseFloat(right[0], 64)
	if err != nil {
		return err
	}

	if leftVal < rightVal {
		return nil
	}
	return fmt.Errorf("condition: ConditionNumericLessThan faield")
})

var ConditionNumericLessThanEqualsValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := strconv.ParseFloat(left, 64)
	if err != nil {
		return err
	}

	rightVal, err := strconv.ParseFloat(right[0], 64)
	if err != nil {
		return err
	}

	if leftVal <= rightVal {
		return nil
	}
	return fmt.Errorf("condition: NumericLessThanEquals faield")
})

var ConditionNumericGreaterThanValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := strconv.ParseFloat(left, 64)
	if err != nil {
		return err
	}

	rightVal, err := strconv.ParseFloat(right[0], 64)
	if err != nil {
		return err
	}

	if leftVal > rightVal {
		return nil
	}
	return fmt.Errorf("condition: NumericGreaterThan faield")
})

var ConditionNumericGreaterThanEqualsValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := strconv.ParseFloat(left, 64)
	if err != nil {
		return err
	}

	rightVal, err := strconv.ParseFloat(right[0], 64)
	if err != nil {
		return err
	}

	if leftVal >= rightVal {
		return nil
	}
	return fmt.Errorf("condition: NumericGreaterThanEquals faield")
})

var ConditionDateEqualsValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := common.ParseTime(left)
	if err != nil {
		return err
	}

	for _, c := range right {
		val, err := common.ParseTime(c)
		if err != nil {
			ts, err := strconv.ParseInt(c, 64, 64)
			if err != nil {
				return err
			}
			val = time.Unix(ts, 0)
		}

		if leftVal == val {
			return nil
		}
	}
	return fmt.Errorf("condition: ConditionDateEquals faield")
})

var ConditionDateNotEqualsValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := common.ParseTime(left)
	if err != nil {
		return err
	}

	for _, c := range right {
		val, err := common.ParseTime(c)
		if err != nil {
			ts, err := strconv.ParseInt(c, 64, 64)
			if err != nil {
				return err
			}
			val = time.Unix(ts, 0)
		}

		if leftVal == val {
			return fmt.Errorf("condition: ConditionDateNotEquals faield")
		}
	}
	return nil
})

var ConditionDateLessThanValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := common.ParseTime(left)
	if err != nil {
		return err
	}

	c := right[0]
	val, err := common.ParseTime(c)
	if err != nil {
		ts, err := strconv.ParseInt(c, 64, 64)
		if err != nil {
			return err
		}
		val = time.Unix(ts, 0)
	}

	if leftVal.Unix() < val.Unix() {
		return nil
	}
	return fmt.Errorf("condition: ConditionDateLessThan faield")
})

var ConditionDateLessThanEqualsValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := common.ParseTime(left)
	if err != nil {
		return err
	}

	c := right[0]
	val, err := common.ParseTime(c)
	if err != nil {
		ts, err := strconv.ParseInt(c, 64, 64)
		if err != nil {
			return err
		}
		val = time.Unix(ts, 0)
	}

	if leftVal.Unix() <= val.Unix() {
		return nil
	}
	return fmt.Errorf("condition: ConditionDateLessThanEquals faield")
})

var ConditionDateGreaterThanValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := common.ParseTime(left)
	if err != nil {
		return err
	}

	c := right[0]
	val, err := common.ParseTime(c)
	if err != nil {
		ts, err := strconv.ParseInt(c, 64, 64)
		if err != nil {
			return err
		}
		val = time.Unix(ts, 0)
	}

	if leftVal.Unix() > val.Unix() {
		return nil
	}
	return fmt.Errorf("condition: ConditionDateGreaterThan faield")
})

var ConditionDateGreaterThanEqualsValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal, err := common.ParseTime(left)
	if err != nil {
		return err
	}

	c := right[0]
	val, err := common.ParseTime(c)
	if err != nil {
		ts, err := strconv.ParseInt(c, 64, 64)
		if err != nil {
			return err
		}
		val = time.Unix(ts, 0)
	}

	if leftVal.Unix() >= val.Unix() {
		return nil
	}
	return fmt.Errorf("condition: ConditionDateGreaterThanEquals faield")
})

var ConditionBoolValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal := false

	if left == BoolTrue {
		leftVal = true
	} else if left == BoolFalse {
		leftVal = false
	} else {
		return fmt.Errorf("condition: ConditionBool faield")
	}

	rightVal := false
	rightRaw := right[0]

	if rightRaw == BoolTrue {
		rightVal = true
	} else if rightRaw == BoolFalse {
		rightVal = false
	} else {
		return fmt.Errorf("condition: ConditionBool faield")
	}

	if leftVal != rightVal {
		return fmt.Errorf("condition: ConditionBool faield")
	}
	return nil
})

var ConditionIPAddressValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal := net.ParseIP(left)
	if leftVal == nil {
		return fmt.Errorf("condition: ConditionIPAddress faield")
	}

	for _, c := range right {
		_, val, err := net.ParseCIDR(c)
		if err != nil {
			return err
		}
		if val.Contains(leftVal) {
			return nil
		}
	}

	return fmt.Errorf("condition: ConditionIPAddress faield")
})

var ConditionNotIPAddressValidator = ConditionValidateFunc(func(left string, right []string) error {
	leftVal := net.ParseIP(left)
	if leftVal == nil {
		return fmt.Errorf("condition: ConditionNotIPAddress faield")
	}

	for _, c := range right {
		_, val, err := net.ParseCIDR(c)
		if err != nil {
			return err
		}
		if val.Contains(leftVal) {
			return fmt.Errorf("condition: ConditionNotIPAddress faield")
		}
	}

	return nil
})

type conditionWebhookRequest struct {
	Value string `json:"value,omitempty"`
}

type conditionWebhookResponse struct {
	HasAccess bool `json:"hasAccess,omitempty"`
}

type ValidateConditionWebhook struct {
	client  *common.WebhookClient
	context context.Context
}

func ConditionWebhookValidator(ctx context.Context, client *common.WebhookClient) *ValidateConditionWebhook {
	return &ValidateConditionWebhook{
		client:  client,
		context: ctx,
	}
}

func (v *ValidateConditionWebhook) Validate(left string, right []string) error {
	url := right[0]
	req := conditionWebhookRequest{Value: left}
	res := conditionWebhookResponse{}
	err := v.client.Do(v.context, url, "authorization.oiam.io/condition-webhook", &req, &res)
	if err != nil {
		return err
	}

	if !res.HasAccess {
		return fmt.Errorf("condition: ConditionWebhook faield")
	}
	return nil
}
