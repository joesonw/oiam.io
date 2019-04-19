import {
    Dialog,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core';
import * as React from 'react';

interface Props {
    onClose(key: string);
    options: string[];
}

export default function ConditionKeyPicker(props: Props) {
    return (
        <Dialog
            open
            onClose={() => props.onClose(null)}
        >
            <List>
                {props.options.map(option => (
                    <ListItem
                        button
                        key={option}
                        onClick={() => props.onClose(option)}
                    >
                        <ListItemText primary={option} />
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
}
