
import {
    Kind,
    Policy,
    PolicyBinding,
    Ref,
} from 'models';
import handleHttp from './handleHttp';

export default class PolicyBindingService {
    static list(): Promise<PolicyBinding[]> {
        return handleHttp(`/iam//${Kind.POLICYBINDING}/`);
    }

    static listBySubject(ref: Ref): Promise<PolicyBinding[]> {
        const query = `?subject.name=${ref.name}&subject.namespace=${ref.namespace}&subject.kind=${ref.kind}`;
        return handleHttp(`/iam//${Kind.POLICYBINDING}/${query}`);
    }

    static listByPolicy(policy: Policy): Promise<PolicyBinding[]> {
        if (!policy.metadata.name && !policy.metadata.namespace) return Promise.resolve([]);
        const query = `?policy.name=${policy.metadata.name}&policy.namespace=${policy.metadata.namespace}`;
        return handleHttp(`/iam//${Kind.POLICYBINDING}/${query}`);
    }

    static save(binding: PolicyBinding): Promise<PolicyBinding> {
        const meta = binding.metadata;
        return handleHttp(
            `/iam//${Kind.POLICYBINDING}/${meta.name}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(binding),
            },
        );
    }

    static remove(name: string): Promise<void> {
        if (!name) return Promise.reject(new Error('name must not be empty'));
        return handleHttp(
            `/iam//${Kind.POLICYBINDING}/${name}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
