import * as Joi from 'joi';
import {
    Group,
    Kind,
    metadataSchema,
} from 'models';
import * as React from 'react';
import GroupService from 'services/GroupService';

import ResourceList from 'components/ResourceList';
import Form from './Form';

interface Props {
}

export default class GroupPage extends React.PureComponent<Props> {
    handleList = (namespace: string) => GroupService.list(namespace)

    handleSave = (group: Group) => {
        const result = Joi.validate(
            group,
            Joi.object({
                description: Joi.string().allow(''),
                metadata: metadataSchema(Kind.GROUP).required(),
            }).unknown(true),
        );
        if (result.error) {
            return Promise.reject(new Error(result.error.message));
        }

        return GroupService.save(group);
    }

    handleRemove = (group: Group) => {
        const meta = group.metadata;
        return GroupService.remove(meta.namespace, meta.name);
    }

    handleNew = () => ({
        metadata: {
            kind: Kind.GROUP,
        },
    })

    render() {
        return (
            <ResourceList
                name="Group"
                formClass={Form}
                onList={this.handleList}
                onSave={this.handleSave}
                onRemove={this.handleRemove}
                onNew={this.handleNew}
            />
        );
    }
}
