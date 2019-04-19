import * as Joi from 'joi';
import {
    Namespace,
    Kind,
    namespaceLessMetadataSchema,
} from 'models';
import * as React from 'react';
import NamespaceService from 'services/NamespaceService';

import ResourceList from 'components/ResourceList';
import Form from './Form';

interface Props {
}

export default class NamespacePage extends React.PureComponent<Props> {
    handleList = (namespace: string) => NamespaceService.list('')

    handleSave = (namespace: Namespace) => {
        const result = Joi.validate(
            namespace,
            Joi.object({
                description: Joi.string().allow(''),
                metadata: namespaceLessMetadataSchema(Kind.NAMESPACE).required(),
            }).unknown(true),
        );
        if (result.error) {
            return Promise.reject(new Error(result.error.message));
        }

        return NamespaceService.save(namespace);
    }

    handleRemove = (namespace: Namespace) => {
        const meta = namespace.metadata;
        return NamespaceService.remove(meta.name);
    }

    handleNew = () => ({
        metadata: {
            kind: Kind.NAMESPACE,
            namespace: '',
        },
    })

    render() {
        return (
            <ResourceList
                disableNamespace
                name="Namespace"
                formClass={Form}
                onList={this.handleList}
                onSave={this.handleSave}
                onRemove={this.handleRemove}
                onNew={this.handleNew}
            />
        );
    }
}
