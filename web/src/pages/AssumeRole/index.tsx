import * as React from 'react';
import {
    Button,
    Card,
    Typography,
    Paper,
    CardActions,
    CardHeader,
    Divider,
    CardContent,
    FormControl,
    Input,
    InputLabel,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core';
import {
    withSnackbar,
    withSnackbarProps,
} from 'notistack';
import ReferenceEditor from 'components/ReferenceEditor';
import {
    Ref,
    Namespace,
    Kind,
    ObjectWithMetadata,
} from 'models';
import toModal from 'components/toModal';
import NamespaceService from 'services/NamespaceService';
import RoleService from 'services/RoleService';
import STSService from 'services/STSService';
import formatInt from 'common/formatInt';

import Result from './Result';

interface Props extends Partial<withSnackbarProps> {
}

interface State {
    name: string;
    namespaces: Namespace[];
    roleRef: Ref;
    duration: string;
}

const $withSnackbar = withSnackbar as any;

@$withSnackbar
export default class AssumeRolePage extends React.Component<Props, State> {
    state = {
        name: '',
        roleRef: null,
        namespaces: [],
        duration: '0',
    };

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        const namespaces = NamespaceService.list();

        const init = {
            name: '',
            roleRef: null,
        };

        return Promise.all([namespaces])
            .then(([namespaces]) => this.setState({ namespaces, ...init }))
            .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
    }

    handleListResource = (kind: string, namespace: string): Promise<ObjectWithMetadata[]> => {
        if (kind === Kind.ROLE) {
            return RoleService.list(namespace);
        }

        return Promise.resolve([]);
    }

    handleAssume = () => {
        STSService.assume(this.state.name, parseInt(this.state.duration || '0'), this.state.roleRef)
            .then(cred => toModal(close => (
                <Result onClose={() => close(null)}>
                    <List>
                        <ListItem divider>
                            <ListItemText
                                primary={cred.key}
                                secondary="Key"
                            />
                        </ListItem>
                        <ListItem divider>
                            <ListItemText
                                primary={cred.secret}
                                secondary="Secret"
                            />
                        </ListItem>
                        <ListItem divider>
                            <ListItemText
                                primary={cred.expireAt}
                                secondary="Expires At"
                            />
                        </ListItem>
                    </List>
                </Result>
            )))
            .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
    }

    render() {
        return (
            <Paper>
                <Card>
                    <CardHeader>
                        <Typography>Assume Role</Typography>
                    </CardHeader>
                    <CardContent>
                        <Card>
                            <CardContent>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="assume-field-name">Session Name</InputLabel>
                                    <Input
                                        id="assume-field-name"
                                        value={this.state.name}
                                        onChange={e => this.setState({ name: e.target.value })}
                                    />
                                </FormControl>
                            </CardContent>
                        </Card>
                        <Divider style={{ margin: '20px 0' }} />
                        <Card>
                            <CardContent>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="assume-field-duration">Duration(Seconds)</InputLabel>
                                    <Input
                                        type="number"
                                        id="assume-field-duration"
                                        value={this.state.duration}
                                        onChange={(e) => {
                                            this.setState({ duration: formatInt(e.target.value, this.state.duration) });
                                        }}
                                    />
                                </FormControl>
                            </CardContent>
                        </Card>
                        <Divider style={{ margin: '20px 0' }} />
                        <Card>
                            <ReferenceEditor
                                title="Role Ref"
                                value={this.state.roleRef ? [this.state.roleRef] : []}
                                namespaces={this.state.namespaces.map(ns => ns.metadata.name)}
                                kinds={[Kind.ROLE]}
                                onList={this.handleListResource}
                                onChange={refs => this.setState({ roleRef: refs[0] })}
                            />
                        </Card>
                    </CardContent>
                    <CardActions>
                        <Button color="primary" onClick={this.handleAssume}>
                            Assume
                        </Button>
                    </CardActions>
                </Card>
            </Paper>
        );
    }
}
