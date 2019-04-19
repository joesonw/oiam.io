
import {
    Kind,
    Role,
} from 'models';
import handleHttp from './handleHttp';

export default class RoleService {
    static list(namespace?: string): Promise<Role[]> {
        return handleHttp(`/iam/${namespace}/${Kind.ROLE}/`);
    }

    static save(role: Role): Promise<Role> {
        const meta = role.metadata;
        return handleHttp(
            `/iam/${meta.namespace}/${Kind.ROLE}/${meta.name}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(role),
            },
        );
    }

    static remove(namespace: string, name: string): Promise<void> {
        if (!namespace || !name) return Promise.reject(new Error('namespace or name must not be empty'));
        return handleHttp(
            `/iam/${namespace}/${Kind.ROLE}/${name}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
