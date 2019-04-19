import {
    Collapse,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';
import {
    AccountBox,
    Book,
    BookOutlined,
    ExpandLess,
    ExpandMore,
    Fingerprint,
    Group,
    GroupOutlined,
    Security,
    Work,
    VpnKey,
    Dns,
    SimCard,
    ExitToApp,
} from '@material-ui/icons';
import { SnackbarProvider } from 'notistack';
import toModal from 'components/toModal';
import { setToken } from 'services/defaults';
import * as React from 'react';
import {
    Switch,
    withRouter,
} from 'react-router';
import {
    Route,
    RouteComponentProps,
} from 'react-router-dom';
import { Token } from 'models';

import Login from './Login';
import routes from './routes';

interface Props extends Partial<RouteComponentProps> {
}

interface State {
    isIAMExpanded: boolean;
    isSTSExpanded: boolean;
    isAuthenticated: boolean;
}

const $withRouter = withRouter as any;

@$withRouter
export default class App extends React.Component<Props, State> {
    state = {
        isIAMExpanded: false,
        isSTSExpanded: false,
        isAuthenticated: false,
    };

    componentDidMount() {
        const tokenStr = localStorage.getItem('sts-token');
        if (tokenStr) {
            try {
                const token: Token = JSON.parse(tokenStr);
                if (new Date(token.expireAt).getTime() > Date.now()) {
                    setToken(token);
                    this.setState({ isAuthenticated: true });
                    return;
                }
            // eslint-disable-next-line no-empty
            } catch {}
        }

        toModal(r => <Login onClose={r} />)
            .then((token) => {
                setToken(token);
                localStorage.setItem('sts-token', JSON.stringify(token));
                this.setState({ isAuthenticated: true });
            });
    }

    render() {
        const path = this.props.location.pathname;
        const parts = path.split('/');
        let group = '';
        let resource = '';
        if (parts.length >= 3) {
            [group, resource] = parts.slice(1);
        }
        return (
            <SnackbarProvider maxSnack={3}>
                {this.state.isAuthenticated
                && (
                    <div>
                        <Drawer
                            variant="permanent"
                            anchor="left"
                        >
                            <List
                                style={{
                                    width: 350,
                                }}
                            >
                                <ListItem
                                    onClick={() => this.setState({ isIAMExpanded: !this.state.isIAMExpanded })}
                                    button
                                >
                                    <ListItemIcon><Security /></ListItemIcon>
                                    <ListItemText primary="Identity and Asset Management" />
                                    {(group === 'iam' || this.state.isIAMExpanded) ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>
                                <Collapse
                                    in={group === 'iam' || this.state.isIAMExpanded}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    <List style={{ marginLeft: 20 }}>
                                        <ListItem
                                            button
                                            selected={resource === 'account'}
                                            onClick={() => this.props.history.push('/iam/account')}
                                        >
                                            <ListItemIcon><AccountBox /></ListItemIcon>
                                            <ListItemText primary="Account" />
                                        </ListItem>
                                        <ListItem
                                            button
                                            selected={resource === 'group'}
                                            onClick={() => this.props.history.push('/iam/group')}
                                        >
                                            <ListItemIcon><Group /></ListItemIcon>
                                            <ListItemText primary="Group" />
                                        </ListItem>
                                        <ListItem
                                            button
                                            selected={resource === 'role'}
                                            onClick={() => this.props.history.push('/iam/role')}
                                        >
                                            <ListItemIcon><Work /></ListItemIcon>
                                            <ListItemText primary="Role" />
                                        </ListItem>
                                        <ListItem
                                            button
                                            selected={resource === 'policy'}
                                            onClick={() => this.props.history.push('/iam/policy')}
                                        >
                                            <ListItemIcon><Book /></ListItemIcon>
                                            <ListItemText primary="Policy" />
                                        </ListItem>
                                        <ListItem
                                            button
                                            selected={resource === 'groupbinding'}
                                            onClick={() => this.props.history.push('/iam/groupbinding')}
                                        >
                                            <ListItemIcon><GroupOutlined /></ListItemIcon>
                                            <ListItemText primary="Group Binding" />
                                        </ListItem>
                                        <ListItem
                                            button
                                            selected={resource === 'policybinding'}
                                            onClick={() => this.props.history.push('/iam/policybinding')}
                                        >
                                            <ListItemIcon><BookOutlined /></ListItemIcon>
                                            <ListItemText primary="Policy Binding" />
                                        </ListItem>
                                        <ListItem
                                            button
                                            selected={resource === 'secret'}
                                            onClick={() => this.props.history.push('/iam/secret')}
                                        >
                                            <ListItemIcon><VpnKey /></ListItemIcon>
                                            <ListItemText primary="Secret" />
                                        </ListItem>
                                        <ListItem
                                            button
                                            selected={resource === 'namespace'}
                                            onClick={() => this.props.history.push('/iam/namespace')}
                                        >
                                            <ListItemIcon><Dns /></ListItemIcon>
                                            <ListItemText primary="Namespace" />
                                        </ListItem>
                                    </List>
                                </Collapse>
                                <Divider />
                                <ListItem
                                    onClick={() => this.setState({ isSTSExpanded: !this.state.isSTSExpanded })}
                                    button
                                >
                                    <ListItemIcon><Fingerprint /></ListItemIcon>
                                    <ListItemText primary="Security Token Service" />
                                    {(group === 'sts' || this.state.isSTSExpanded) ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>
                                <Collapse
                                    in={group === 'sts' || this.state.isSTSExpanded}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    <List style={{ marginLeft: 20 }}>
                                        <ListItem
                                            button
                                            selected={resource === 'assume'}
                                            onClick={() => this.props.history.push('/sts/assume')}
                                        >
                                            <ListItemIcon><SimCard /></ListItemIcon>
                                            <ListItemText primary="Assume Role" />
                                        </ListItem>
                                    </List>
                                </Collapse>
                                <ListItem
                                    button
                                    onClick={() => {
                                        localStorage.removeItem('sts-token');
                                        window.location.reload();
                                    }}
                                >
                                    <ListItemIcon><ExitToApp /></ListItemIcon>
                                    <ListItemText primary="Exit" />
                                </ListItem>
                            </List>
                        </Drawer>
                        <main
                            style={{
                                padding: 20,
                                marginLeft: 350,
                            }}
                        >
                            {routes.map(route => (
                                <Switch key={route.path}>
                                    <Route
                                        key={route.path}
                                        path={route.path}
                                        component={route.body}
                                        exact
                                    />
                                </Switch>
                            ))}
                        </main>
                    </div>
                )}
            </SnackbarProvider>
        );
    }
}
