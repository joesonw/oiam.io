
import {
    Group,
    Kind,
} from 'models';
import handleHttp from './handleHttp';

export default class GroupService {
    static list(namespace?: string): Promise<Group[]> {
        return handleHttp(`/iam/${namespace}/${Kind.GROUP}/`);
    }

    static save(group: Group): Promise<Group> {
        const meta = group.metadata;
        return handleHttp(
            `/iam/${meta.namespace}/${Kind.GROUP}/${meta.name}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(group),
            },
        );
    }

    static remove(namespace: string, name: string): Promise<void> {
        if (!namespace || !name) return Promise.reject(new Error('namespace or name must not be empty'));
        return handleHttp(
            `/iam/${namespace}/${Kind.GROUP}/${name}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
