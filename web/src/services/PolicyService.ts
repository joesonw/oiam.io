
import {
    Kind,
    Policy,
} from 'models';
import handleHttp from './handleHttp';

export default class PolicyService {
    static list(namespace?: string): Promise<Policy[]> {
        return handleHttp(`/iam/${namespace}/${Kind.POLICY}/`);
    }

    static get(namespace: string, name: string): Promise<Policy> {
        return handleHttp(`/iam/${namespace}/${Kind.POLICY}/${name}`);
    }

    static save(policy: Policy): Promise<Policy> {
        const meta = policy.metadata;
        return handleHttp(
            `/iam/${meta.namespace}/${Kind.POLICY}/${meta.name}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(policy),
            },
        );
    }

    static remove(namespace: string, name: string): Promise<void> {
        if (!namespace || !name) return Promise.reject(new Error('namespace or name must not be empty'));
        return handleHttp(
            `/iam/${namespace}/${Kind.POLICY}/${name}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
