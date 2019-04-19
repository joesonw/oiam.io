import * as Joi from 'joi';
import {
    Policy,
    Kind,
    metadataSchema,
    refSchema,
    ConditionKey,
    Effect,
    refEqual,
} from 'models';
import * as React from 'react';
import PolicyService from 'services/PolicyService';

import ResourceList from 'components/ResourceList';
import Form from './Form';

interface Props {
}

export default class PolicyPage extends React.PureComponent<Props> {
    handleList = (namespace: string) => PolicyService.list(namespace)

    handleSave = (policy: Policy) => {
        const conditionKeys = Object.keys(ConditionKey);
        const conditionValues = conditionKeys.map(k => ConditionKey[k]);

        const conditionSchema = Joi.object()
            .pattern(
                Joi.string(),
                Joi.object().pattern(
                    Joi.string(),
                    Joi.array().items(Joi.string()).unique(),
                ),
            );

        const resSchema = Joi.object({
            kind: Joi.string().required(),
            name: Joi.string().required(),
            namespace: Joi.string().required(),
            tags: Joi.object().unknown(),
        });

        const result = Joi.validate(
            policy,
            Joi.object({
                description: Joi.string().allow(''),
                metadata: metadataSchema(Kind.POLICY).required(),
                priority: Joi.number().integer().positive().required(),
                statements: Joi.array().items(Joi.object({
                    description: Joi.string().allow(''),
                    priority: Joi.number().integer().positive(),
                    effect: Joi.string().allow(Effect.ALLOW, Effect.DENY).required(),
                    condition: conditionSchema,
                    actions: Joi.array().items(Joi.string()).unique(),
                    notActions: Joi.array().items(Joi.string()).unique(),
                    principals: Joi.array().items(refSchema()).unique(refEqual),
                    notPrincipals: Joi.array().items(refSchema()).unique(refEqual),
                    resources: Joi.array().items(resSchema).unique(refEqual),
                    notResources: Joi.array().items(resSchema).unique(refEqual),
                })),
            }).unknown(true),
        );

        if (result.error) {
            return Promise.reject(new Error(result.error.message));
        }

        return PolicyService.save(policy);
    }

    handleRemove = (policy: Policy) => {
        const meta = policy.metadata;
        return PolicyService.remove(meta.namespace, meta.name);
    }

    handleNew = () => ({
        priority: 0,
        statements: [],
        metadata: {
            kind: Kind.POLICY,
        },
    })

    render() {
        return (
            <ResourceList
                name="Policy"
                formClass={Form}
                onList={this.handleList}
                onSave={this.handleSave}
                onRemove={this.handleRemove}
                onNew={this.handleNew}
            />
        );
    }
}
