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
    GroupBinding,
    Kind,
    Metadata,
    Namespace,
    ObjectWithMetadata,
    Ref,
} from 'models';
import { withSnackbar, withSnackbarProps } from 'notistack';
import * as React from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import AccountService from 'services/AccountService';
import GroupService from 'services/GroupService';
import NamespaceService from 'services/NamespaceService';

type ExtraProps = Partial<RouteComponentProps> & Partial<withSnackbarProps>;

interface Props extends ExtraProps {
    insert?: boolean;
    readOnly?: boolean;
    open?: boolean;
    namespaces: string[];
    value: GroupBinding;
    onClose(): void;
    onSubmit(value: GroupBinding): void;
}

interface State {
    group: Ref;
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
        group: {},
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
                group: props.value.groupRef,
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
            groupRef: this.state.group,
            metadata: this.state.metadata,
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (!_.isEqual(prevProps.value, this.props.value)) {
            this.setState({
                metadata: this.props.value.metadata,
                subjects: this.props.value.subjects,
                group: this.props.value.groupRef,
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
        return Promise.resolve([]);
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleClose}
                disableBackdropClick={!this.props.readOnly}
            >
                <DialogTitle>GroupBinding</DialogTitle>
                <DialogContent>
                    <Card>
                        <ReferenceEditor
                            title="Group"
                            readOnly={this.props.readOnly}
                            onView={ref => this.props.history.push(routeToRef(ref, 'view'))}
                            value={this.state.group ? [this.state.group] : []}
                            namespaces={this.state.namespaces.map(ns => ns.metadata.name)}
                            kinds={[Kind.GROUP]}
                            onList={this.handleListResource}
                            onChange={groups => this.setState({ group: groups[0] })}
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
                            kinds={[Kind.ACCOUNT]}
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
