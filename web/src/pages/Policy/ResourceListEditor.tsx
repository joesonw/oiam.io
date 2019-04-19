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

import ResourceEditor from './ResourceEditor';

interface TagProps {
    label: string;
    value: string;
}

function Tag(props: TagProps) {
    return (
        <span
            style={{
                padding: 3,
                border: '1px solid #e0e0e0',
                borderRadius: 4,
                marginLeft: 3,
            }}
        >
            {props.label}
=
            {props.value}
        </span>
    );
}

interface Props extends React.Props<void> {
    readOnly?: boolean;
    value: Ref[];
    onChange(refs: Ref[]): void;
}

export default function ResourceListEditor(props: Props) {
    return (
        <List>
            {props.value.map((ref, i) => (
                <ListItem key={`${ref.kind}/${ref.namespace}/${ref.name}`}>
                    <ListItemText
                        primary={`${ref.namespace}/${ref.name}`}
                        secondary={(
                            <span>
                                <span>{ref.kind}</span>
                                <span style={{ display: 'block' }}>
                                    {Object.keys(ref.tags || {}).map(key => (
                                        <Tag key={key} label={key} value={ref.tags[key]} />
                                    ))}
                                </span>
                            </span>
                        )}
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
                                                    Are you sure to delete ref "{ref.namespace}/{ref.name}"?
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
                                        ResourceEditor.present(ref, props.readOnly).then((ref) => {
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
