import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Typography,
} from '@material-ui/core';
import routeToRef from 'common/routeToRef';
import MetadataEditor from 'components/MetadataEditor';
import ReferenceEditor from 'components/ReferenceEditor';
import * as _ from 'lodash';
import {
    Kind,
    Metadata,
    Namespace,
    ObjectWithMetadata,
    PolicyBinding,
    Ref,
} from 'models';
import { withSnackbar, withSnackbarProps } from 'notistack';
import * as React from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import AccountService from 'services/AccountService';
import GroupService from 'services/GroupService';
import NamespaceService from 'services/NamespaceService';
import PolicyService from 'services/PolicyService';
import RoleService from 'services/RoleService';

type ExtraProps = Partial<RouteComponentProps> & Partial<withSnackbarProps>;

interface Props extends ExtraProps {
    insert?: boolean;
    readOnly?: boolean;
    open?: boolean;
    namespaces: string[];
    value: PolicyBinding;
    onClose(): void;
    onSubmit(vlaue: PolicyBinding): void;
}

interface State {
    policy: Ref;
    metadata: Metadata;
    subjects: Ref[];
    namespaces: Namespace[];
}

const $withSnackbar = withSnackbar as any;
const $withRouter = withRouter as any;

@$withRouter
@$withSnackbar
export default class Form extends React.Component<Props, State> {
    state = {
        policy: {},
        metadata: {},
        subjects: [],
        namespaces: [],
    };

    constructor(props: Props) {
        super(props);
        if (props.value) {
            this.state = {
                metadata: props.value.metadata,
                subjects: props.value.subjects,
                policy: props.value.policyRef,
                namespaces: [],
            };
        }
    }

    handleClose = () => {
        this.props.onClose();
    }

    handleSave = () => {
        this.props.onSubmit({
            subjects: this.state.subjects,
            policyRef: this.state.policy,
            metadata: this.state.metadata,
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (!_.isEqual(prevProps.value, this.props.value)) {
            this.setState({
                metadata: this.props.value.metadata,
                subjects: this.props.value.subjects,
                policy: this.props.value.policyRef,
            });
            this.loadData();
        }
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const namespaces = NamespaceService.list()
            .then(namespaces => Promise.resolve(namespaces));

        return Promise.all([namespaces])
            .then(([namespaces]) => this.setState({ namespaces }))
            .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
    }

    handleListResource = (kind: string, namespace: string): Promise<ObjectWithMetadata[]> => {
        if (kind === Kind.ACCOUNT) {
            return AccountService.list(namespace);
        }
        if (kind === Kind.GROUP) {
            return GroupService.list(namespace);
        }
        if (kind === Kind.ROLE) {
            return RoleService.list(namespace);
        }
        if (kind === Kind.POLICY) {
            return PolicyService.list(namespace);
        }
        return Promise.resolve([]);
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleClose}
                disableBackdropClick={!this.props.readOnly}
            >
                <DialogTitle>PolicyBinding</DialogTitle>
                <DialogContent>
                    <Card>
                        <ReferenceEditor
                            title="Policy"
                            readOnly={this.props.readOnly}
                            onView={ref => this.props.history.push(routeToRef(ref, 'view'))}
                            value={this.state.policy ? [this.state.policy] : []}
                            namespaces={this.state.namespaces.map(ns => ns.metadata.name)}
                            kinds={[Kind.POLICY]}
                            onList={this.handleListResource}
                            onChange={policys => this.setState({ policy: policys[0] })}
                        />
                    </Card>
                    <Divider style={{ margin: '20px 0' }} />
                    <Card>
                        <ReferenceEditor
                            multiple
                            onView={ref => this.props.history.push(routeToRef(ref, 'view'))}
                            title="Subjects"
                            readOnly={this.props.readOnly}
                            value={this.state.subjects}
                            namespaces={this.state.namespaces.map(ns => ns.metadata.name)}
                            kinds={[Kind.ACCOUNT, Kind.GROUP, Kind.ROLE]}
                            onList={this.handleListResource}
                            onChange={subjects => this.setState({ subjects })}
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
                                namespaces={[]}
                                disableNamespace
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
