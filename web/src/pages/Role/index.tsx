import * as Joi from 'joi';
import {
    Role,
    Kind,
    metadataSchema,
} from 'models';
import * as React from 'react';
import RoleService from 'services/RoleService';

import ResourceList from 'components/ResourceList';
import Form from './Form';

interface Props {
}

export default class RolePage extends React.PureComponent<Props> {
    handleList = (namespace: string) => RoleService.list(namespace)

    handleSave = (role: Role) => {
        const result = Joi.validate(
            role,
            Joi.object({
                description: Joi.string().allow(''),
                metadata: metadataSchema(Kind.ROLE).required(),
            }).unknown(true),
        );
        if (result.error) {
            return Promise.reject(new Error(result.error.message));
        }

        return RoleService.save(role);
    }

    handleRemove = (role: Role) => {
        const meta = role.metadata;
        return RoleService.remove(meta.namespace, meta.name);
    }

    handleNew = () => ({
        metadata: {
            kind: Kind.ROLE,
        },
    })

    render() {
        return (
            <ResourceList
                name="Role"
                formClass={Form}
                onList={this.handleList}
                onSave={this.handleSave}
                onRemove={this.handleRemove}
                onNew={this.handleNew}
            />
        );
    }
}
