import {
    Button,
    DialogContentText,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    Typography,
} from '@material-ui/core';
import Alert from 'components/Alert';
import {
    ObjectWithMetadata,
    Ref,
    refEqual,
    toRef,
} from 'models';
import * as React from 'react';

import RefEditor from './RefEditor';

interface Props extends React.Props<void> {
    readOnly?: boolean;
    value: Ref[];
    namespaces: string[];
    kinds: string[];
    onList(kind: string, namespace: string): Promise<ObjectWithMetadata[]>;
    title: React.ReactNode;
    multiple?: boolean;
    onView?(ref: Ref): void;
    onChange(refs: Ref[]): void;
}

export default function ReferenceEditor(props: Props) {
    const checkValue = (ref: Ref) => {
        if (!ref.kind || !ref.namespace || !ref.name) return false;
        return !props.value.find(r => r.kind === ref.kind
            && r.namespace === ref.namespace
            && r.name === ref.name);
    };

    const onList = (edit = false) => (kind: string, namespace: string): Promise<ObjectWithMetadata[]> => props.onList(kind, namespace)
        .then(items => Promise.resolve(items.filter(item => edit || !props.value.find(v => refEqual(v, toRef(item))))));

    return (
        <List>
            <ListSubheader>
                <Typography>{props.title}</Typography>
                {(!props.readOnly && (props.multiple || !props.value.length))
                    && (
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={() => {
                                RefEditor.present(
                                    { namespace: '', name: '', kind: '' },
                                    props.namespaces,
                                    props.kinds,
                                    onList(),
                                ).then((ref) => {
                                    if (!checkValue(ref)) return;
                                    const refs = props.value.slice();
                                    refs.push(ref);
                                    props.onChange(refs);
                                });
                            }}
                        >
                            {props.multiple ? 'ADD' : 'PICK'}
                        </Button>
                    )
                }
            </ListSubheader>
            {props.value.map((ref, i) => (
                <ListItem key={`${ref.kind}/${ref.namespace}/${ref.name}`}>
                    <ListItemText
                        primary={`${ref.namespace}/${ref.name}`}
                        secondary={ref.kind}
                    />
                    <ListItemSecondaryAction>
                        {props.onView
                        && (
                            <Button
                                color="primary"
                                onClick={() => props.onView(ref)}
                            >
                                View
                            </Button>
                        )}
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
                                                    Are you sure to delete ref "{ref.namespace}{ref.name}"?
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
                                {props.multiple
                                && (
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            RefEditor.present(
                                                ref,
                                                props.namespaces,
                                                props.kinds,
                                                onList(true),
                                            ).then((ref) => {
                                                if (!checkValue(ref)) return;
                                                const refs = props.value.slice();
                                                refs[i] = ref;
                                                props.onChange(refs);
                                            });
                                        }}
                                    >
                                    Edit
                                    </Button>
                                )}
                            </React.Fragment>
                        )
                        }
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
        </List>
    );
}
