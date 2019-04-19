
import {
    Account,
    Kind,
} from 'models';
import handleHttp from './handleHttp';

export default class AccountService {
    static list(namespace?: string): Promise<Account[]> {
        return handleHttp(`/iam/${namespace}/${Kind.ACCOUNT}/`);
    }

    static save(account: Account): Promise<Account> {
        const meta = account.metadata;
        return handleHttp(
            `/iam/${meta.namespace}/${Kind.ACCOUNT}/${meta.name}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(account),
            },
        );
    }

    static remove(namespace: string, name: string): Promise<void> {
        if (!namespace || !name) return Promise.reject(new Error('namespace or name must not be empty'));
        return handleHttp(
            `/iam/${namespace}/${Kind.ACCOUNT}/${name}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }
}
