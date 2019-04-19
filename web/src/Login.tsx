import * as React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Input,
    Snackbar,
    IconButton,
} from '@material-ui/core';
import {
    Close,
} from '@material-ui/icons';
import STSService from 'services/STSService';
import { Token } from 'models';

interface Props {
    onClose(token: Token);
}

interface State {
    key: string;
    secret: string;
    error: string;
}


export default class Login extends React.Component<Props, State> {
    state = {
        key: '',
        secret: '',
        error: '',
    }

    handleAuth = () => {
        STSService.auth(this.state.key, this.state.secret)
            .then(this.props.onClose)
            .catch(e => this.setState({ error: e.message }));
    }

    render() {
        return (
            <Dialog open>
                <DialogTitle>Authenticate</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="login-field-key">Key</InputLabel>
                        <Input
                            id="login-field-key"
                            value={this.state.key}
                            onChange={e => this.setState({ key: e.target.value })}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="login-field-secret">Secret</InputLabel>
                        <Input
                            type="password"
                            id="login-field-secret"
                            value={this.state.secret}
                            onChange={e => this.setState({ secret: e.target.value })}
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleAuth}>GO</Button>
                </DialogActions>
                <Snackbar
                    open={!!this.state.error}
                    autoHideDuration={6000}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    message={<span>{this.state.error}</span>}
                    action={[
                        <IconButton
                            key="close"
                            color="inherit"
                            onClick={() => this.setState({ error: '' })}
                        >
                            <Close />
                        </IconButton>,
                    ]}
                />
            </Dialog>
        );
    }
}
