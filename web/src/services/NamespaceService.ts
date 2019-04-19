import {
    Kind,
    Namespace,
} from 'models';
import handleHttp from './handleHttp';

export default class NamespaceService {
    static list(namespace = '*'): Promise<Namespace[]> {
        return handleHttp(`/iam/${namespace}/${Kind.NAMESPACE}/`);
    }

    static save(ns: Namespace): Promise<Namespace> {
        const meta = ns.metadata;
        return handleHttp(
            `/iam//${Kind.NAMESPACE}/${meta.name}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ns),
            },
        );
    }

    static remove(name: string): Promise<void> {
        if (!name) return Promise.reject(new Error('namespace or name must not be empty'));
        return handleHttp(
            `/iam//${Kind.NAMESPACE}/${name}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
