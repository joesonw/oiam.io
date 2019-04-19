import {
    Kind,
    Ref,
} from 'models';

export default function routeToRef(ref: Ref, action: string) {
    switch (ref.kind) {
    case Kind.ACCOUNT: return `/iam/account/?${action}=${ref.namespace}/${ref.name}`;
    case Kind.NAMESPACE: return `/iam/namespace/?${action}=${ref.name}`;
    case Kind.GROUP: return `/iam/group/?${action}=${ref.namespace}/${ref.name}`;
    case Kind.POLICY: return `/iam/policy/?${action}=${ref.namespace}/${ref.name}`;
    case Kind.ROLE: return `/iam/role/?${action}=${ref.namespace}/${ref.name}`;
    case Kind.SECRET: return `/iam/secret/?${action}=${ref.name}`;
    case Kind.ROLEBINDING: return `/iam/rolebinding/?${action}=${ref.name}`;
    case Kind.POLICYBINDING: return `/iam/policybinding/?${action}=${ref.name}`;
    case Kind.GROUPBINDING: return `/iam/groupbinding/?${action}=${ref.name}`;
    case Kind.SERVICE: return `/iam/service/?${action}=${ref.namespace}/${ref.name}`;
    default: return '';
    }
}
