import * as Joi from 'joi';
import {
    Secret,
    Kind,
    namespaceLessMetadataSchema,
} from 'models';
import * as React from 'react';
import SecretService from 'services/SecretService';
import ResourceList from 'components/ResourceList';

import Form from './Form';

interface Props {
}

export default class SecretPage extends React.PureComponent<Props> {
    handleList = (namespace: string) => SecretService.list();

    handleSave = (secret: Secret) => {
        const result = Joi.validate(
            secret,
            Joi.object({
                description: Joi.string().allow(''),
                metadata: namespaceLessMetadataSchema(Kind.SECRET).required(),
            }).unknown(true),
        );
        if (result.error) {
            return Promise.reject(new Error(result.error.message));
        }

        return SecretService.save(secret);
    }

    handleRemove = (secret: Secret) => {
        const meta = secret.metadata;
        return SecretService.remove(meta.name);
    }

    handleNew = () => ({
        key: '',
        secret: '',
        metadata: {
            kind: Kind.SECRET,
        },
    });

    render() {
        return (
            <ResourceList
                disableNamespace
                name="Secret"
                formClass={Form}
                onList={this.handleList}
                onSave={this.handleSave}
                onRemove={this.handleRemove}
                onNew={this.handleNew}
            />
        );
    }
}
