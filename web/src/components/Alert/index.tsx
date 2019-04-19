import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@material-ui/core';
import toModal from 'components/toModal';
import * as React from 'react';

interface Props extends React.Props<Alert> {
    onClose(flag: boolean): void;
    title: React.ReactNode;
    body: React.ReactNode;
    okText: React.ReactNode;
    cancelText: React.ReactNode;
}

export default class Alert extends React.PureComponent<Props> {
    static present(
        title: React.ReactNode,
        body: React.ReactNode,
        okText: React.ReactNode = 'Ok',
        cancelText: React.ReactNode = 'Cancel',
    ): Promise<boolean> {
        return toModal(r => (
            <Alert
                onClose={r}
                title={title}
                body={body}
                okText={okText}
                cancelText={cancelText}
            />
        ));
    }

    render() {
        return (
            <Dialog
                open
                onClose={() => this.props.onClose(false)}
            >
                <DialogTitle>{this.props.title}</DialogTitle>
                <DialogContent>{this.props.body}</DialogContent>
                <DialogActions>
                    <Button onClick={() => this.props.onClose(false)} color="default">
                        {this.props.cancelText}
                    </Button>
                    <Button onClick={() => this.props.onClose(true)} color="primary">
                        {this.props.okText}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
