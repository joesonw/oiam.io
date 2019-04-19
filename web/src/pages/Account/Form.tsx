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
    MenuItem,
    Select,
    Typography,
} from '@material-ui/core';
import routeToRef from 'common/routeToRef';
import MetadataEditor from 'components/MetadataEditor';
import ReferenceList from 'components/ReferenceList';
import * as _ from 'lodash';
import {
    Account,
    AccountType,
    Metadata,
    Ref,
    toRef,
} from 'models';
import { withSnackbar, withSnackbarProps } from 'notistack';
import * as React from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import GroupBindingService from 'services/GroupBindingService';
import PolicyBindingService from 'services/PolicyBindingService';

type ExtraProps = Partial<RouteComponentProps> & Partial<withSnackbarProps>;

interface Props extends ExtraProps {
    insert?: boolean;
    readOnly?: boolean;
    open?: boolean;
    namespaces: string[];
    value: Account;
    onClose(): void;
    onSubmit(value: Account): void;
}

interface State {
    description: string;
    type: AccountType;
    metadata: Metadata;
    groups: {ref: Ref; binding: Ref}[];
    policies: {ref: Ref; binding: Ref}[];
}

const $withSnackbar = withSnackbar as any;
const $withRouter = withRouter as any;

@$withRouter
@$withSnackbar
export default class Form extends React.Component<Props, State> {
    state = {
        description: '',
        type: AccountType.USER,
        metadata: {},
        groups: [],
        policies: [],
    };

    constructor(props: Props) {
        super(props);
        if (props.value) {
            this.state = {
                description: props.value.description,
                type: props.value.type,
                metadata: props.value.metadata,
                groups: [],
                policies: [],
            };
        }
    }

    handleClose = () => {
        this.props.onClose();
    }

    handleSave = () => {
        this.props.onSubmit({
            description: this.state.description,
            type: this.state.type,
            metadata: this.state.metadata,
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (!_.isEqual(prevProps.value, this.props.value)) {
            this.setState({
                description: this.props.value.description,
                type: this.props.value.type,
                metadata: this.props.value.metadata,
            });
            this.loadData();
        }
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        if (!this.props.value || !this.props.value.metadata) return;

        const groups = GroupBindingService.listBySubject(toRef(this.props.value))
            .then(bindings => Promise.resolve(
                bindings.map(r => ({
                    ref: r.groupRef,
                    binding: toRef(r),
                })),
            ));

        const policies = PolicyBindingService.listBySubject(toRef(this.props.value))
            .then(bindings => Promise.resolve(
                bindings.map(b => ({
                    ref: b.policyRef,
                    binding: toRef(b),
                })),
            ));

        return Promise.all([groups, policies])
            .then(([groups, policies]) => this.setState({ groups, policies }))
            .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleClose}
                disableBackdropClick={!this.props.readOnly}
            >
                <DialogTitle>Account</DialogTitle>
                <DialogContent>
                    <Card>
                        <CardContent>
                            <Typography color="default">Account</Typography>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="account-editor-field-description">Description</InputLabel>
                                <Input
                                    multiline
                                    rowsMax={3}
                                    disabled={this.props.readOnly}
                                    id="account-editor-field-description"
                                    value={this.state.description}
                                    onChange={e => this.setState({ description: e.target.value })}
                                />
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="account-editor-field-type">Account Type</InputLabel>
                                <Select
                                    disabled={this.props.readOnly}
                                    id="account-editor-field-field"
                                    value={this.state.type}
                                    onChange={e => this.setState({ type: e.target.value as any })}
                                >
                                    <MenuItem value={AccountType.USER}>User</MenuItem>
                                    <MenuItem value={AccountType.SERVICE}>Service</MenuItem>
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>
                    <Divider style={{ margin: '20px 0' }} />
                    <Card>
                        <ReferenceList
                            title="Groups"
                            value={this.state.groups}
                            onBind={ref => this.props.history.push(routeToRef(ref, 'view'))}
                            onView={ref => this.props.history.push(routeToRef(ref, 'view'))}
                            onEdit={ref => this.props.history.push(routeToRef(ref, 'edit'))}
                        />
                    </Card>
                    <Divider style={{ margin: '20px 0' }} />
                    <Card>
                        <ReferenceList
                            title="Policies"
                            value={this.state.policies}
                            onBind={ref => this.props.history.push(routeToRef(ref, 'view'))}
                            onView={ref => this.props.history.push(routeToRef(ref, 'view'))}
                            onEdit={ref => this.props.history.push(routeToRef(ref, 'edit'))}
                        />
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
