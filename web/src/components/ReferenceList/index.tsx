import {
    Button,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    Typography,
} from '@material-ui/core';
import {
    Ref,
} from 'models';
import * as React from 'react';

interface Props extends React.Props<void> {
    value: {ref: Ref; binding: Ref}[];
    title: React.ReactNode;
    onBind(ref: Ref): void;
    onView(ref: Ref): void;
    onEdit(ref: Ref): void;
}

export default function ReferenceList(props: Props) {
    return (
        <List>
            <ListSubheader>
                <Typography>{props.title}</Typography>
            </ListSubheader>
            {props.value.map(ref => (
                <ListItem key={`${ref.ref.kind}/${ref.ref.namespace}/${ref.ref.name}`}>
                    <ListItemText
                        primary={`${ref.ref.namespace}/${ref.ref.name}`}
                        secondary={ref.ref.kind}
                    />
                    <ListItemSecondaryAction>
                        <Button color="default" onClick={() => props.onBind(ref.binding)}>
                            Binding
                        </Button>
                        <Button color="default" onClick={() => props.onView(ref.ref)}>
                            View
                        </Button>
                        <Button color="primary" onClick={() => props.onEdit(ref.ref)}>
                            Edit
                        </Button>
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
        </List>
    );
}
