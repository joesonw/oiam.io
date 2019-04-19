import * as Joi from 'joi';
import * as _ from 'lodash';
import {
    Account,
    AccountType,
    Kind,
    metadataSchema,
} from 'models';
import * as React from 'react';
import AccountService from 'services/AccountService';

import ResourceList from 'components/ResourceList';
import Form from './Form';

interface Props {
}

export default class AccountPage extends React.PureComponent<Props> {
    handleList = (namespace: string) => AccountService.list(namespace)

    handleSave = (account: Account) => {
        const result = Joi.validate(
            account,
            Joi.object({
                description: Joi.string().allow(''),
                type: Joi.string().required().only(..._.values(AccountType)).required(),
                metadata: metadataSchema(Kind.ACCOUNT).required(),
            }).unknown(true),
        );
        if (result.error) {
            return Promise.reject(new Error(result.error.message));
        }

        return AccountService.save(account);
    }

    handleRemove = (account: Account) => {
        const meta = account.metadata;
        return AccountService.remove(meta.namespace, meta.name);
    }

    handleNew = () => ({
        type: AccountType.USER,
        metadata: {
            kind: Kind.ACCOUNT,
        },
    })

    render() {
        return (
            <ResourceList
                name="Account"
                formClass={Form}
                onList={this.handleList}
                onSave={this.handleSave}
                onRemove={this.handleRemove}
                onNew={this.handleNew}
            />
        );
    }
}
