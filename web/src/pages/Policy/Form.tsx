import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Input,
    InputLabel,
    Typography,
} from '@material-ui/core';
import routeToRef from 'common/routeToRef';
import MetadataEditor from 'components/MetadataEditor';
import ReferenceList from 'components/ReferenceList';
import formatInt from 'common/formatInt';
import * as _ from 'lodash';
import {
    Effect,
    Metadata,
    Policy,
    PolicyStatement,
    Ref,
    toRef,
} from 'models';
import { withSnackbar, withSnackbarProps } from 'notistack';
import * as React from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import PolicyBindingService from 'services/PolicyBindingService';

import PolicyStatementForm from './PolicyStatementForm';

type ExtraProps = Partial<RouteComponentProps> & Partial<withSnackbarProps>;

interface Props extends ExtraProps {
    insert?: boolean;
    readOnly?: boolean;
    open?: boolean;
    namespaces: string[];
    value: Policy;
    onClose(): void;
    onSubmit(value: Policy): void;
}

interface State {
    description: string;
    priority: string;
    statements: PolicyStatement[];
    metadata: Metadata;
    expandedStatementIndex: number;
    subjects: {ref: Ref; binding: Ref}[];
}

const $withSnackbar = withSnackbar as any;
const $withRouter = withRouter as any;

@$withRouter
@$withSnackbar
export default class Form extends React.Component<Props, State> {
    state = {
        description: '',
        metadata: {},
        priority: '0',
        statements: [],
        subjects: [],
        expandedStatementIndex: 0,
    };

    constructor(props: Props) {
        super(props);
        if (props.value) {
            this.state = {
                description: props.value.description,
                metadata: props.value.metadata,
                priority: (props.value.priority || 0).toString(),
                statements: props.value.statements || [],
                subjects: [],
                expandedStatementIndex: 0,
            };
        }
    }

    handleClose = () => {
        this.props.onClose();
    }

    handleSave = () => {
        this.props.onSubmit({
            description: this.state.description,
            metadata: this.state.metadata,
            priority: parseInt(this.state.priority || '0'),
            statements: this.state.statements,
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (!_.isEqual(prevProps.value, this.props.value)) {
            this.setState({
                description: this.props.value.description,
                metadata: this.props.value.metadata,
                priority: (this.props.value.priority || 0).toString(),
                statements: this.props.value.statements || [],
                subjects: [],
            });
            this.loadData();
        }
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        if (!this.props.value || !this.props.value.metadata) return;
        const subjects = PolicyBindingService.listByPolicy(this.props.value)
            .then(bindings => Promise.resolve(
                bindings.map(b => b.subjects.map(ref => ({
                    ref,
                    binding: toRef(b),
                }))).reduce((l, s) => l.concat(s), []),
            ));

        return Promise.all([subjects])
            .then(([subjects]) => this.setState({ subjects }))
            .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleClose}
                disableBackdropClick={!this.props.readOnly}
            >
                <DialogTitle>Policy</DialogTitle>
                <DialogContent>
                    <Card>
                        <CardContent>
                            <Typography color="default">Policy</Typography>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="policy-editor-field-description">Description</InputLabel>
                                <Input
                                    multiline
                                    rowsMax={3}
                                    disabled={this.props.readOnly}
                                    id="policy-editor-field-description"
                                    value={this.state.description}
                                    onChange={e => this.setState({ description: e.target.value })}
                                />
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="policy-editor-field-priority">Priority</InputLabel>
                                <Input
                                    type="number"
                                    disabled={this.props.readOnly}
                                    id="policy-editor-field-priority"
                                    value={this.state.priority}
                                    onChange={e => this.setState({ priority: formatInt(e.target.value, this.state.priority) })}
                                />
                            </FormControl>
                        </CardContent>
                    </Card>
                    <Divider style={{ margin: '20px 0' }} />
                    <Card>
                        <ReferenceList
                            title="Bindings"
                            value={this.state.subjects}
                            onBind={ref => this.props.history.push(routeToRef(ref, 'view'))}
                            onView={ref => this.props.history.push(routeToRef(ref, 'view'))}
                            onEdit={ref => this.props.history.push(routeToRef(ref, 'edit'))}
                        />
                    </Card>
                    <Divider style={{ margin: '20px 0' }} />
                    <Card>
                        <CardContent>
                            <div
                                style={{
                                    alignItems: 'center',
                                    display: 'flex',
                                }}
                            >
                                <Typography style={{ flex: 1 }} color="default">Statements</Typography>
                                {!this.props.readOnly
                                    && (
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                const statements = this.state.statements.slice();
                                                statements.push({
                                                    effect: Effect.ALLOW,
                                                    priority: 0,
                                                    actions: [],
                                                    notActions: [],
                                                    principals: [],
                                                    notPrincipals: [],
                                                    resources: [],
                                                    notResources: [],
                                                    condition: {},
                                                });
                                                this.setState({
                                                    statements,
                                                });
                                            }}
                                        >
                                        Add
                                        </Button>
                                    )
                                }
                            </div>
                            {this.state.statements.map((statement, i) => (
                                <PolicyStatementForm
                                    key={i}
                                    index={i}
                                    readOnly={this.props.readOnly}
                                    onToggle={() => {
                                        let { expandedStatementIndex } = this.state;
                                        if (expandedStatementIndex === i) {
                                            expandedStatementIndex = -1;
                                        } else {
                                            expandedStatementIndex = i;
                                        }
                                        this.setState({ expandedStatementIndex });
                                    }}
                                    onDelete={() => {
                                        const statements = this.state.statements.slice();
                                        statements.splice(i);
                                        this.setState({
                                            statements,
                                        });
                                    }}
                                    onChange={(statement) => {
                                        const statements = this.state.statements.slice();
                                        statements[i] = statement;
                                        this.setState({
                                            statements,
                                        });
                                    }}
                                    expanded={this.state.expandedStatementIndex === i}
                                    value={statement}
                                />
                            ))}
                        </CardContent>
                    </Card>
                    <Divider style={{ margin: '20px 0' }} />
                    <Card>
                        <CardContent>
                            <Typography color="default">Metadata</Typography>
                            <MetadataEditor
                                readOnly={this.props.readOnly}
                                insert={this.props.insert}
                                value={this.state.metadata}
                                onChange={metadata => this.setState({ metadata })}
                                namespaces={this.props.namespaces}
                            />
                        </CardContent>
                    </Card>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.onClose} color="default">Close</Button>
                    {!this.props.readOnly
                    && (
                        <Button onClick={this.handleSave} color="primary">
                            {this.props.insert ? 'Create' : 'Save'}
                        </Button>
                    )
                    }
                </DialogActions>
            </Dialog>
        );
    }
}
