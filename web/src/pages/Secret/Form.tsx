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
    InputAdornment,
    IconButton,
} from '@material-ui/core';
import routeToRef from 'common/routeToRef';
import MetadataEditor from 'components/MetadataEditor';
import ReferenceEditor from 'components/ReferenceEditor';
import NamespaceService from 'services/NamespaceService';
import AccountService from 'services/AccountService';
import * as _ from 'lodash';
import {
    Metadata,
    Ref,
    Kind,
    Secret,
    Namespace,
    ObjectWithMetadata,
} from 'models';
import { withSnackbar, withSnackbarProps } from 'notistack';
import * as React from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import {
    VisibilityOff,
    Visibility,
} from '@material-ui/icons';

type ExtraProps = Partial<RouteComponentProps> & Partial<withSnackbarProps>;

interface Props extends ExtraProps {
    insert?: boolean;
    readOnly?: boolean;
    open?: boolean;
    namespaces: string[];
    value: Secret;
    onClose(): void;
    onSubmit(value: Secret): void;
}

interface State {
    description: string;
    metadata: Metadata;
    key: string;
    secret: string;
    accountRef: Ref;
    namespaces: Namespace[];
    showSecret: boolean;
}

const $withSnackbar = withSnackbar as any;
const $withRouter = withRouter as any;

@$withRouter
@$withSnackbar
export default class Form extends React.Component<Props, State> {
    state = {
        description: '',
        metadata: {},
        accountRef: {},
        key: '',
        secret: '',
        namespaces: [],
        showSecret: false,
    };

    constructor(props: Props) {
        super(props);
        if (props.value) {
            this.state = {
                description: props.value.description,
                metadata: props.value.metadata,
                accountRef: props.value.accountRef,
                key: props.value.key,
                secret: props.value.secret,
                namespaces: [],
                showSecret: false,
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
            accountRef: this.state.accountRef,
            key: this.state.key,
            secret: this.state.secret,
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (!_.isEqual(prevProps.value, this.props.value)) {
            this.setState({
                description: this.props.value.description,
                metadata: this.props.value.metadata,
                accountRef: this.props.value.accountRef,
                key: this.props.value.key,
                secret: this.props.value.secret,
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
        return Promise.resolve([]);
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleClose}
                disableBackdropClick={!this.props.readOnly}
            >
                <DialogTitle>Secret</DialogTitle>
                <DialogContent>
                    <Card>
                        <CardContent>
                            <Typography color="default">Secret</Typography>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="secret-editor-field-description">Description</InputLabel>
                                <Input
                                    multiline
                                    rowsMax={3}
                                    disabled={this.props.readOnly}
                                    id="secret-editor-field-description"
                                    value={this.state.description}
                                    onChange={e => this.setState({ description: e.target.value })}
                                />
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="secret-editor-field-key">Key</InputLabel>
                                <Input
                                    disabled={this.props.readOnly}
                                    id="secret-editor-field-key"
                                    value={this.state.key}
                                    onChange={e => this.setState({ key: e.target.value })}
                                />
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="secret-editor-field-secret">Secret</InputLabel>
                                <Input
                                    type={this.state.showSecret ? 'text' : 'password'}
                                    disabled={this.props.readOnly}
                                    id="secret-editor-field-secret"
                                    value={this.state.secret}
                                    onChange={e => this.setState({ secret: e.target.value })}
                                    endAdornment={(
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => this.setState({ showSecret: !this.state.showSecret })}>
                                                {this.state.showSecret ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )}
                                />
                            </FormControl>
                        </CardContent>
                    </Card>
                    <Divider style={{ margin: '20px 0' }} />
                    <Card>
                        <ReferenceEditor
                            title="Account Ref"
                            readOnly={this.props.readOnly}
                            onView={ref => this.props.history.push(routeToRef(ref, 'view'))}
                            value={this.state.accountRef ? [this.state.accountRef] : []}
                            namespaces={this.state.namespaces.map(ns => ns.metadata.name)}
                            kinds={[Kind.ACCOUNT]}
                            onList={this.handleListResource}
                            onChange={accounts => this.setState({ accountRef: accounts[0] })}
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
