import {
    Button,
    Chip,
    DialogContentText,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
    Input,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import {
    ToggleButton,
    ToggleButtonGroup,
} from '@material-ui/lab';
import Alert from 'components/Alert';
import Prompt from 'components/Prompt';
import toModal from 'components/toModal';
import formatInt from 'common/formatInt';
import {
    ConditionKey,
    Effect,
    PolicyStatement,
} from 'models';
import * as React from 'react';

import ConditionKeyPicker from './ConditionKeyPicker';
import CondtionListEditor from './CondtionListEditor';
import RefEditor from './RefEditor';
import RefListEditor from './RefListEditor';
import ResourceEditor from './ResourceEditor';
import ResourceListEditor from './ResourceListEditor';

interface Props {
    readOnly?: boolean;
    expanded?: boolean;
    index: number;
    value: PolicyStatement;
    onToggle();
    onDelete();
    onChange(value: PolicyStatement);
}

export default function PolicyStatementForm(props: Props) {
    return (
        <ExpansionPanel expanded={props.expanded} onChange={props.onToggle}>
            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Typography style={{ flex: 1 }}>
                        Statement #{props.index + 1}
                    </Typography>
                    {!props.readOnly
                        && (
                            <Button color="secondary" onClick={props.onDelete}>
                                Delete
                            </Button>
                        )
                    }
                </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <div style={{ width: '100%' }}>
                    <div>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={1}>
                                        <Typography color="primary">Priority</Typography>
                                    </TableCell>
                                    <TableCell align="right" colSpan={2}>
                                        <Input
                                            type="number"
                                            disabled={props.readOnly}
                                            value={props.value.priority.toString()}
                                            onChange={(e) => {
                                                const old = props.value.priority || 0;
                                                const priority = parseInt(
                                                    formatInt(e.target.value, old.toString())
                                                    || '0',
                                                );
                                                props.onChange({
                                                    ...props.value,
                                                    priority,
                                                });
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={1}>
                                        <Typography color="primary">Effect</Typography>
                                    </TableCell>
                                    <TableCell align="right" colSpan={2}>
                                        <div style={{ display: 'inline-block' }}>
                                            <ToggleButtonGroup
                                                exclusive
                                                color="primary"
                                                value={props.value.effect}
                                                onChange={(_, effect) => {
                                                    if (props.readOnly) return;
                                                    props.onChange({ ...props.value, effect });
                                                }}
                                            >
                                                <ToggleButton value={Effect.ALLOW}>ALLOW</ToggleButton>
                                                <ToggleButton value={Effect.DENY}>DENY</ToggleButton>
                                            </ToggleButtonGroup>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <Typography color="primary">Actions</Typography>
                                    </TableCell>
                                    <TableCell align="right" colSpan={2}>
                                        {!props.readOnly
                                            && (
                                                <Button
                                                    color="primary"
                                                    onClick={() => {
                                                        Prompt.present('Action name')
                                                            .then((action) => {
                                                                if (!action) return;
                                                                const actions = (props.value.actions || []).slice();
                                                                actions.push(action);
                                                                props.onChange({
                                                                    ...props.value,
                                                                    actions,
                                                                });
                                                            });
                                                    }}
                                                >
                                                Add
                                                </Button>
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        {(props.value.actions || []).map((action, i) => (
                                            props.readOnly
                                                ? (
                                                    <Chip
                                                        key={action}
                                                        style={{ margin: 5 }}
                                                        variant="outlined"
                                                        label={action}
                                                    />
                                                )
                                                : (
                                                    <Chip
                                                        key={action}
                                                        style={{ margin: 5 }}
                                                        variant="outlined"
                                                        label={action}
                                                        onDelete={() => {
                                                            Alert.present(
                                                                'Are you sure',
                                                                (
                                                                    <DialogContentText>
                                                                        Are you sure to delete action "{action}"?
                                                                    </DialogContentText>
                                                                ),
                                                            ).then((flag) => {
                                                                if (!flag) return;
                                                                const actions = (props.value.actions || []).slice();
                                                                actions.splice(i, 1);
                                                                props.onChange({
                                                                    ...props.value,
                                                                    actions,
                                                                });
                                                            });
                                                        }}
                                                    />
                                                )
                                        ))}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <Typography color="primary">Not Actions</Typography>
                                    </TableCell>
                                    <TableCell align="right" colSpan={2}>
                                        {!props.readOnly
                                            && (
                                                <Button
                                                    color="primary"
                                                    onClick={() => {
                                                        Prompt.present('Action name')
                                                            .then((action) => {
                                                                if (!action) return;
                                                                const notActions = (props.value.notActions || []).slice();
                                                                notActions.push(action);
                                                                props.onChange({
                                                                    ...props.value,
                                                                    notActions,
                                                                });
                                                            });
                                                    }}
                                                >
                                                Add
                                                </Button>
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        {(props.value.notActions || []).map((action, i) => (
                                            props.readOnly
                                                ? (
                                                    <Chip
                                                        key={action}
                                                        style={{ margin: 5 }}
                                                        variant="outlined"
                                                        label={action}
                                                    />
                                                )
                                                : (
                                                    <Chip
                                                        key={action}
                                                        style={{ margin: 5 }}
                                                        variant="outlined"
                                                        label={action}
                                                        onDelete={() => {
                                                            Alert.present(
                                                                'Are you sure',
                                                                (
                                                                    <DialogContentText>
                                                                        Are you sure to delete action "{action}"?
                                                                    </DialogContentText>
                                                                ),
                                                            ).then((flag) => {
                                                                if (!flag) return;
                                                                const notActions = (props.value.notActions || []).slice();
                                                                notActions.splice(i, 1);
                                                                props.onChange({
                                                                    ...props.value,
                                                                    notActions,
                                                                });
                                                            });
                                                        }}
                                                    />
                                                )
                                        ))}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <Typography color="primary">Principals</Typography>
                                    </TableCell>
                                    <TableCell align="right" colSpan={2}>
                                        {!props.readOnly
                                            && (
                                                <Button
                                                    color="primary"
                                                    onClick={() => {
                                                        RefEditor.present({
                                                            namespace: '',
                                                            name: '',
                                                            kind: '',
                                                        }).then((principal) => {
                                                            if (
                                                                // eslint-disable-next-line max-len
                                                                !principal.name || !principal.namespace || !principal.kind
                                                            ) {
                                                                return;
                                                            }
                                                            const principals = (props.value.principals || []).slice();
                                                            principals.push(principal);
                                                            props.onChange({ ...props.value, principals });
                                                        });
                                                    }}
                                                >
                                                ADD
                                                </Button>
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={2}>
                                        <RefListEditor
                                            readOnly={props.readOnly}
                                            value={props.value.principals || []}
                                            onChange={principals => props.onChange({ ...props.value, principals })}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <Typography color="primary">Not Principals</Typography>
                                    </TableCell>
                                    <TableCell align="right" colSpan={2}>
                                        {!props.readOnly
                                            && (
                                                <Button
                                                    color="primary"
                                                    onClick={() => {
                                                        RefEditor.present({
                                                            namespace: '',
                                                            name: '',
                                                            kind: '',
                                                        }).then((principal) => {
                                                            if (
                                                                // eslint-disable-next-line max-len
                                                                !principal.name || !principal.namespace || !principal.kind
                                                            ) {
                                                                return;
                                                            }
                                                            const notPrincipals = (props.value.notPrincipals || []).slice();
                                                            notPrincipals.push(principal);
                                                            props.onChange({ ...props.value, notPrincipals });
                                                        });
                                                    }}
                                                >
                                                ADD
                                                </Button>
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={2}>
                                        <RefListEditor
                                            readOnly={props.readOnly}
                                            value={props.value.notPrincipals || []}
                                            onChange={notPrincipals => props.onChange({ ...props.value, notPrincipals })}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <Typography color="primary">Resources</Typography>
                                    </TableCell>
                                    <TableCell align="right" colSpan={2}>
                                        {!props.readOnly
                                            && (
                                                <Button
                                                    color="primary"
                                                    onClick={() => {
                                                        ResourceEditor.present({
                                                            namespace: '',
                                                            name: '',
                                                            kind: '',
                                                        }).then((resource) => {
                                                            // eslint-disable-next-line max-len
                                                            if (!resource.name || !resource.namespace || !resource.kind) {
                                                                return;
                                                            }
                                                            const resources = (props.value.resources || []).slice();
                                                            resources.push(resource);
                                                            props.onChange({ ...props.value, resources });
                                                        });
                                                    }}
                                                >
                                                ADD
                                                </Button>
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <ResourceListEditor
                                            readOnly={props.readOnly}
                                            value={props.value.resources || []}
                                            onChange={resources => props.onChange({ ...props.value, resources })}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <Typography color="primary">Not Resources</Typography>
                                    </TableCell>
                                    <TableCell align="right" colSpan={2}>
                                        {!props.readOnly
                                            && (
                                                <Button
                                                    color="primary"
                                                    onClick={() => {
                                                        ResourceEditor.present({
                                                            namespace: '',
                                                            name: '',
                                                            kind: '',
                                                        }).then((resource) => {
                                                            // eslint-disable-next-line max-len
                                                            if (!resource.name || !resource.namespace || !resource.kind) {
                                                                return;
                                                            }
                                                            const notResources = (props.value.notResources || []).slice();
                                                            notResources.push(resource);
                                                            props.onChange({ ...props.value, notResources });
                                                        });
                                                    }}
                                                >
                                                ADD
                                                </Button>
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <ResourceListEditor
                                            readOnly={props.readOnly}
                                            value={props.value.notResources || []}
                                            onChange={notResources => props.onChange({ ...props.value, notResources })}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={1}>
                                        <Typography color="primary">Conditions</Typography>
                                    </TableCell>
                                    <TableCell align="right" colSpan={2}>
                                        {!props.readOnly
                                            && (
                                                <Button
                                                    color="primary"
                                                    onClick={() => {
                                                        const keys = Object.keys(props.value.condition);
                                                        const options = Object.keys(ConditionKey)
                                                            .map(key => ConditionKey[key])
                                                            .filter(key => keys.indexOf(key) === -1);
                                                        // eslint-disable-next-line max-len
                                                        toModal(r => <ConditionKeyPicker onClose={r} options={options} />)
                                                            .then((key) => {
                                                                if (!key) return;
                                                                props.onChange({
                                                                    ...props.value,
                                                                    condition: {
                                                                        ...props.value.condition,
                                                                        [key as any]: {},
                                                                    },
                                                                });
                                                            });
                                                    }}
                                                >
                                                ADD
                                                </Button>
                                            )
                                        }
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <div>
                        <CondtionListEditor
                            readOnly={props.readOnly}
                            value={props.value.condition || {}}
                            onChange={condition => props.onChange({ ...props.value, condition })}
                        />
                    </div>
                </div>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
}
