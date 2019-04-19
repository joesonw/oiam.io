
import {
    Group,
    GroupBinding,
    Kind,
    Ref,
} from 'models';
import handleHttp from './handleHttp';

export default class GroupBindingService {
    static list(): Promise<GroupBinding[]> {
        return handleHttp(`/iam//${Kind.GROUPBINDING}/`);
    }

    static listBySubject(ref: Ref): Promise<GroupBinding[]> {
        const query = `?subject.name=${ref.name}&subject.namespace=${ref.namespace}&subject.kind=${ref.kind}`;
        return handleHttp(`/iam//${Kind.GROUPBINDING}/${query}`);
    }

    static listByGroup(group: Group): Promise<GroupBinding[]> {
        if (!group.metadata.name && !group.metadata.namespace) return Promise.resolve([]);
        const query = `?group.name=${group.metadata.name}&group.namespace=${group.metadata.namespace}`;
        return handleHttp(`/iam//${Kind.GROUPBINDING}/${query}`);
    }

    static save(binding: GroupBinding): Promise<GroupBinding> {
        const meta = binding.metadata;
        return handleHttp(
            `/iam//${Kind.GROUPBINDING}/${meta.name}`,
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
            `/iam//${Kind.GROUPBINDING}/${name}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
