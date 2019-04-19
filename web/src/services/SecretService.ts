
import {
    Secret,
    Kind,
} from 'models';
import handleHttp from './handleHttp';

export default class SecretService {
    static list(): Promise<Secret[]> {
        return handleHttp(`/iam//${Kind.SECRET}/`);
    }

    static save(secret: Secret): Promise<Secret> {
        const meta = secret.metadata;
        return handleHttp(
            `/iam//${Kind.SECRET}/${meta.name}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(secret),
            },
        );
    }

    static remove(name: string): Promise<void> {
        if (!name) return Promise.reject(new Error('name must not be empty'));
        return handleHttp(
            `/iam//${Kind.SECRET}/${name}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
