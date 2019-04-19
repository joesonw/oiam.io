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
import * as _ from 'lodash';
import {
    Group,
    Metadata,
    Ref,
    toRef,
} from 'models';
import {
    withSnackbar,
    withSnackbarProps,
} from 'notistack';
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
    value: Group;
    onClose(): void;
    onSubmit(value: Group): void;
}

interface State {
    description: string;
    metadata: Metadata;
    subjects: {ref: Ref; binding: Ref}[];
    policies: {ref: Ref; binding: Ref}[];
}

const $withSnackbar = withSnackbar as any;
const $withRouter = withRouter as any;

@$withRouter
@$withSnackbar
export default class Form extends React.Component<Props, State> {
    state = {
        description: '',
        metadata: {},
        subjects: [],
        policies: [],
    };

    constructor(props: Props) {
        super(props);
        if (props.value) {
            this.state = {
                description: props.value.description,
                metadata: props.value.metadata,
                subjects: [],
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
            metadata: this.state.metadata,
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (!_.isEqual(prevProps.value, this.props.value)) {
            this.setState({
                description: this.props.value.description,
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
        const subjects = GroupBindingService.listByGroup(this.props.value)
            .then(bindings => Promise.resolve(
                bindings.map(b => b.subjects.map(ref => ({
                    ref,
                    binding: toRef(b),
                }))).reduce((l, s) => l.concat(s), []),
            ));

        const policies = PolicyBindingService.listBySubject(toRef(this.props.value))
            .then(bindings => Promise.resolve(
                bindings.map(b => ({
                    ref: b.policyRef,
                    binding: toRef(b),
                })),
            ));

        return Promise.all([subjects, policies])
            .then(([subjects, policies]) => this.setState({ subjects, policies }))
            .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleClose}
                disableBackdropClick={!this.props.readOnly}
            >
                <DialogTitle>Group</DialogTitle>
                <DialogContent>
                    <Card>
                        <CardContent>
                            <Typography color="default">Group</Typography>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="group-editor-field-description">Description</InputLabel>
                                <Input
                                    multiline
                                    rowsMax={3}
                                    disabled={this.props.readOnly}
                                    id="group-editor-field-description"
                                    value={this.state.description}
                                    onChange={e => this.setState({ description: e.target.value })}
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
