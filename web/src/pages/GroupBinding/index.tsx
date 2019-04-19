import * as Joi from 'joi';
import {
    GroupBinding,
    Kind,
    namespaceLessMetadataSchema,
    refSchema,
} from 'models';
import * as React from 'react';
import GroupBindingService from 'services/GroupBindingService';

import ResourceList from 'components/ResourceList';
import Form from './Form';

interface Props {
}

export default class GroupBindingPage extends React.PureComponent<Props> {
    handleList = (namespace: string) => GroupBindingService.list()

    handleSave = (groupBinding: GroupBinding) => {
        const result = Joi.validate(
            groupBinding,
            Joi.object({
                subjects: Joi.array().items(refSchema(Kind.ACCOUNT)),
                groupRef: refSchema(Kind.GROUP).required(),
                metadata: namespaceLessMetadataSchema(Kind.GROUPBINDING).required(),
            }).unknown(true),
        );
        if (result.error) {
            return Promise.reject(new Error(result.error.message));
        }

        return GroupBindingService.save(groupBinding);
    }

    handleRemove = (groupBinding: GroupBinding) => {
        const meta = groupBinding.metadata;
        return GroupBindingService.remove(meta.name);
    }

    handleNew = () => ({
        subjects: [],
        groupRef: null,
        metadata: {
            kind: Kind.GROUPBINDING,
        },
    })

    render() {
        return (
            <ResourceList
                disableNamespace
                name="GroupBinding"
                formClass={Form}
                onList={this.handleList}
                onSave={this.handleSave}
                onRemove={this.handleRemove}
                onNew={this.handleNew}
            />
        );
    }
}
