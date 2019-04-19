# Open Identity and Asset Management

<table>
  <tr>
    <td><img src="https://github.com/joesonw/oiam.io/blob/master/images/1.png?raw=true"></td>
    <td><img src="https://github.com/joesonw/oiam.io/blob/master/images/2.png?raw=true"></td>
    <td><img src="https://github.com/joesonw/oiam.io/blob/master/images/3.png?raw=true"></td>
  </tr>
  <tr>
    <td><img src="https://github.com/joesonw/oiam.io/blob/master/images/4.png?raw=true"></td>
    <td><img src="https://github.com/joesonw/oiam.io/blob/master/images/5.png?raw=true"></td>
    <td><img src="https://github.com/joesonw/oiam.io/blob/master/images/6.png?raw=true"></td>
  </tr>
  <tr>
    <td><img src="https://github.com/joesonw/oiam.io/blob/master/images/7.png?raw=true"></td>
    <td><img src="https://github.com/joesonw/oiam.io/blob/master/images/8.png?raw=true"></td>
    <td><img src="https://github.com/joesonw/oiam.io/blob/master/images/9.png?raw=true"></td>
  </tr>
</table>


## Introduction

> This project is inspired by AWS IAM, a highly customizable authentication and authorization system, while yet simple and robust.

## Explained

All authentication starts with `Account`. You'll create `Secret`s that belongs to certain `Account` (by specifying `AccountRef` field)


Once you are authenticated through `Secret`, your _Policies_/_Permissions_/_AccessRights_ come from two sources:
 * through `PolicyBinding`, your `Account` will be given `Policy` (which contains detail authorization rules)
 * or through `GroupBinding`, where you have get `Group`'s `Policy`, through `PolicyBinding` between `Group` and `Policy`
 * \*\* if authenticated through credentials from `assumeRole`, you will get policy from `Role`, works in the same fashion as `Group`
 
 
Now `Policy` contains what you can/cannot access through all dimensions.


## API

> All requests are expected to have a token in header `X-Authorization-Token` except `/sts/auth`

### /sts/auth

```
{
    key string
    durationSeconds int
    currentTimeSeconds int
    nonce string 
    signature string
}
```

> signature: params are first sorted by key, key and value are then joined by '=' into pairs, pairs are then joined by '&', append secret, then sha1 the entire string

example go implementation:
```
func signParams(params map[string]interface{}, secret string) string {
	var keys []string
	for key := range params {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	paris := make([]string, len(keys))
	for i, key := range keys {
		paris[i] = fmt.Sprintf("%s=%v", key, params[key])
	}
	str := strings.Join(paris, "&") + secret
	h := sha1.New()
	h.Write([]byte(str))
	return hex.EncodeToString(h.Sum(nil))
}
```

### /sts/assume

```
{
    name string // used as generated account's name
    durationSeconds int
    role Ref
}
```

> requested account should have permission on resource { namespace: 'oiam.io', name: 'sts', tags: { 'role.name': <role name> or *, 'role.namespace': <role namespace> or * } } 

## /sts/access

```
{
    service Ref
    action string
}
```

## /iam/<namespace> or */<kind>/<name> or empty

> query are parsed as tags  or search criteria on certain resources (e.g, for `Account`, `type` can be in query to filter account types)


## Embedded ConditionOperators
```
"StringEquals"
"StringNotEquals"
"StringEqualsIgnoreCase"
"StringNotEqualsIgnoreCase"
"StringLike"
"StringNotLike"
"NumericEquals"
"NumericNotEquals"
"NumericLessThan"
"NumericLessThanEquals"
"NumericGreaterThan"
"NumericGreaterThanEquals"
"DateEquals"
"DateNotEquals"
"DateLessThan"
"DateLessThanEquals"
"DateGreaterThan"
"DateGreaterThanEquals"
"Bool"
"IpAddress"
"NotIpAddress"
"Webhook"
```

## Embedded ConditionKeys
```
v1alpha.conditionkeys.oiam.io/PrincipalKind
v1alpha.conditionkeys.oiam.io/PrincipalNamespace
v1alpha.conditionkeys.oiam.io/PrincipalName
v1alpha.conditionkeys.oiam.io/ResourceKind
v1alpha.conditionkeys.oiam.io/ResourceNamespace
v1alpha.conditionkeys.oiam.io/ResourceName
v1alpha.conditionkeys.oiam.io/CurrentTime
v1alpha.conditionkeys.oiam.io/EpochTime

v1alpha.conditionkeys.oiam.io/PrincipalTag/*
v1alpha.conditionkeys.oiam.io/ResourceTag/*
v1alpha.conditionkeys.oiam.io/Header/*
```

## Models

#### Kinds 
```
Kind (
    Account       = "account.v1alpha.oiam.io"
    Group         = "group.v1alpha.oiam.io"
    Namespace     = "namespace.v1alpha.oiam.io"
    Policy        = "policy.v1alpha.oiam.io"
    Role          = "role.v1alpha.oiam.io"
    Secret        = "secret.v1alpha.oiam.io"
    PolicyBinding = "policybinding.v1alpha.oiam.io"
    GroupBinding  = "groupbinding.v1alpha.oiam.io"
    Service       = "service.v1alpha.oiam.io"
)
```


>  PolicyBinding, GroupBinding, Secret, Namespace do not have `namespace` field (or will be forced to be empty)

#### Metadata

```
Metadata {
    kind: Kind
    namespace: string
    name: string
    tags: map[string]string
}
```

### Account


```
AccountType ( 
    User = "user"
    Service = "service"
)
```

```
Account {
    description string 
    type        AccountType
    metadata    Metadata
}
```

### Group

```
Group {
    description string 
    metadata    Metadata
}
```

### Role

```
Role {
    description string 
    metadata    Metadata
}
```

