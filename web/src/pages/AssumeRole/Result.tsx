import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
} from '@material-ui/core';

interface Props {
    onClose();
    children: React.ReactNode;
}

export default function Result(props: Props) {
    return (
        <Dialog
            open
            onClose={props.onClose}
        >
            <DialogContent>
                {props.children}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={props.onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
