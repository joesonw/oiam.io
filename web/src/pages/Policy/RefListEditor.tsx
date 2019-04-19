import {
    Button,
    DialogContentText,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
} from '@material-ui/core';
import Alert from 'components/Alert';
import {
    Ref,
} from 'models';
import * as React from 'react';

import RefEditor from './RefEditor';

interface Props extends React.Props<void> {
    readOnly?: boolean;
    value: Ref[];
    onChange(refs: Ref[]): void;
}

export default function RefListEditor(props: Props) {
    return (
        <List>
            {props.value.map((ref, i) => (
                <ListItem key={`${ref.namespace}/${ref.name}`}>
                    <ListItemText
                        primary={`${ref.namespace}/${ref.name}`}
                        secondary={ref.kind}
                    />
                    <ListItemSecondaryAction>
                        {!props.readOnly
                        && (
                            <React.Fragment>
                                <Button
                                    color="secondary"
                                    onClick={() => {
                                        Alert.present(
                                            'Are you sure?',
                                            (
                                                <DialogContentText>
                                                    Are you sure to delete "ref{ref.namespace}/{ref.name}"?
                                                </DialogContentText>
                                            ),
                                        )
                                            .then((flag) => {
                                                if (!flag) return;
                                                const refs = props.value.slice();
                                                refs.splice(i, 1);
                                                props.onChange(refs);
                                            })
                                            .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
                                    }}
                                >
                                Remove
                                </Button>
                                <Button
                                    color="primary"
                                    onClick={() => {
                                        RefEditor.present(ref).then((ref) => {
                                            const refs = props.value.slice();
                                            refs[i] = ref;
                                            props.onChange(refs);
                                        });
                                    }}
                                >
                                Edit
                                </Button>
                            </React.Fragment>
                        )
                        }
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
        </List>
    );
}
