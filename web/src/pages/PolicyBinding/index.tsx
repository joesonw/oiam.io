import * as Joi from 'joi';
import {
    PolicyBinding,
    Kind,
    namespaceLessMetadataSchema,
    refSchema,
} from 'models';
import * as React from 'react';
import PolicyBindingService from 'services/PolicyBindingService';

import ResourceList from 'components/ResourceList';
import Form from './Form';

interface Props {
}

export default class PolicyBindingPage extends React.PureComponent<Props> {
    handleList = (namespace: string) => PolicyBindingService.list()

    handleSave = (policyBinding: PolicyBinding) => {
        const result = Joi.validate(
            policyBinding,
            Joi.object({
                subjects: Joi.array().items(refSchema(Kind.ACCOUNT, Kind.GROUP, Kind.ROLE)),
                policyRef: refSchema(Kind.POLICY).required(),
                metadata: namespaceLessMetadataSchema(Kind.POLICYBINDING).required(),
            }).unknown(true),
        );
        if (result.error) {
            return Promise.reject(new Error(result.error.message));
        }

        return PolicyBindingService.save(policyBinding);
    }

    handleRemove = (policyBinding: PolicyBinding) => {
        const meta = policyBinding.metadata;
        return PolicyBindingService.remove(meta.name);
    }

    handleNew = () => ({
        policyRef: null,
        subjects: [],
        metadata: {
            kind: Kind.POLICYBINDING,
        },
    })

    render() {
        return (
            <ResourceList
                disableNamespace
                name="PolicyBinding"
                formClass={Form}
                onList={this.handleList}
                onSave={this.handleSave}
                onRemove={this.handleRemove}
                onNew={this.handleNew}
            />
        );
    }
}
