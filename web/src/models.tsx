import * as Joi from 'joi';
import * as _ from 'lodash';

export enum Kind {
    ACCOUNT = 'account.v1alpha.oiam.io',
    GROUP = 'group.v1alpha.oiam.io',
    NAMESPACE = 'namespace.v1alpha.oiam.io',
    POLICY = 'policy.v1alpha.oiam.io',
    ROLE = 'role.v1alpha.oiam.io',
    SECRET = 'secret.v1alpha.oiam.io',
    ROLEBINDING = 'rolebinding.v1alpha.oiam.io',
    POLICYBINDING = 'policybinding.v1alpha.oiam.io',
    GROUPBINDING = 'groupbinding.v1alpha.oiam.io',
    SERVICE = 'service.v1alpha.oiam.io',
}

export interface Ref {
    kind?: Kind | string;
    namespace?: string;
    name?: string;
    tags?: Tags;
}

export interface Metadata {
    namespace?: string;
    name?: string;
    kind?: Kind;
    uid?: string;
    tags?: Tags;
    version?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export interface Tags {[key: string]: string}

export enum AccountType {
    USER = 'user',
    SERVICE = 'service',
}

export interface Account {
    description?: string;
    type?: AccountType;
    metadata?: Metadata;
}

export interface Service {
    description?: string;
    actions?: string[];
    metadata?: Metadata;
}

export interface Secret {
    key?: string;
    secret?: string;
    description?: string;
    accountRef?: Ref;
    metadata?: Metadata;
}

export interface Role {
    description?: string;
    metadata?: Metadata;
}

export interface Group {
    description?: string;
    metadata?: Metadata;
}

export interface Namespace {
    description?: string;
    metadata?: Metadata;
}

export interface Policy {
    description?: string;
    metadata?: Metadata;
    priority?: number;
    statements?: PolicyStatement[];
}

export enum Effect {
    ALLOW = 'Allow',
    DENY = 'Deny',
}

export enum ConditionKey {
    STRING_EQUALS = 'StringEquals',
    STRING_NOT_EQUALS = 'StringNotEquals',
    STRING_EQUALS_IGNORE_CASE = 'StringEqualsIgnoreCase',
    STRING_NOT_EQUALS_IGNORE_CASE = 'StringNotEqualsIgnoreCase',
    STRING_LIKE = 'StringLike',
    STRING_NOT_LIKE = 'StringNotLike',
    NUMERIC_EQUALS = 'NumericEquals',
    NUMERIC_NOT_EQUALS = 'NumericNotEquals',
    NUMERIC_LESS_THAN = 'NumericLessThan',
    NUMERIC_LESS_THAN_EQUALS = 'NumericLessThanEquals',
    NUMERIC_GREATER_THAN = 'NumericGreaterThan',
    NUMERIC_GREATER_THAN_EQUALS = 'NumericGreaterThanEquals',
    DATE_EQUALS = 'DateEquals',
    DATE_NOT_EQUALS = 'DateNotEquals',
    DATE_LESS_THAN = 'DateLessThan',
    DATE_LESS_THAN_EQUALS = 'DateLessThanEquals',
    DATE_GREATER_THAN = 'DateGreaterThan',
    DATE_GREATER_THAN_EQUALS = 'DateGreaterThanEquals',
    BOOL = 'Bool',
    IP_ADDRESS = 'IpAddress',
    NOT_IP_ADDRESS = 'NotIpAddress',
    WEBHOOK = 'Webhook',
}

export interface Condition {[key: string]: {[key: string]: string[]}}

export interface PolicyStatement {
    description?: string;
    priority?: number;
    effect?: Effect;
    actions?: string[];
    notActions?: string[];
    principals?: Ref[];
    notPrincipals?: Ref[];
    resources?: Resource[];
    notResources?: Resource[];
    condition?: Condition;
}

export interface RoleBinding {
    subjects?: Ref[];
    roleRef?: Ref;
    metadata?: Metadata;
}

export interface GroupBinding {
    subjects?: Ref[];
    groupRef?: Ref;
    metadata?: Metadata;
}

export interface PolicyBinding {
    subjects?: Ref[];
    policyRef?: Ref;
    metadata?: Metadata;
}

export interface Resource {
    kind?: Kind | string;
    name?: string;
    namespace?: string;
    tags?: Tags;
}

export interface ObjectWithMetadata {
    metadata?: Metadata;
}

export function toRef(obj: ObjectWithMetadata): Ref {
    const meta = obj.metadata;
    return ({
        name: meta.name,
        namespace: meta.namespace,
        kind: meta.kind,
        tags: meta.tags,
    });
}

export function refEqual(a: Ref, b: Ref) {
    return a.kind === b.kind && a.namespace === b.namespace && a.name === b.name;
}

export function metadataEqual(a: ObjectWithMetadata, b: ObjectWithMetadata) {
    return refEqual(toRef(a), toRef(b));
}

export function metadataSchema(...kinds: Kind[]) {
    let kindSchema = Joi.string();
    if (kinds.length) {
        kindSchema = kindSchema.only(...kinds);
    } else {
        kindSchema = kindSchema.only(..._.values(Kind));
    }
    return Joi.object({
        kind: kindSchema.required(),
        name: Joi.string().required(),
        namespace: Joi.string().required(),
    }).unknown(true);
}

export function namespaceLessMetadataSchema(kind: Kind) {
    return Joi.object({
        kind: Joi.string().only(kind),
        name: Joi.string().required(),
    }).unknown(true);
}

export function refSchema(...kinds: string[]) {
    let kindSchema = Joi.string();
    if (kinds.length) {
        kindSchema = kindSchema.only(...kinds);
    } else {
        kindSchema = kindSchema.only(..._.values(Kind));
    }
    return Joi.object({
        kind: kindSchema.required(),
        name: Joi.string().required(),
        namespace: Joi.string().required(),
    });
}

export interface Token {
    id?: string;
    key?: string;
    createdAt?: string;
    expireAt?: string;
    sessionName?: string;
    accountRef?: Ref;
}

export interface Credential {
    key?: string;
    secret?: string;
    name?: string;
    expireAt?: string;
    policy?: Policy;
    roleRef?: Ref;
}
