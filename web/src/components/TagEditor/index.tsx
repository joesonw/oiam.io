import {
    Chip,
    DialogContentText,
} from '@material-ui/core';
import Alert from 'components/Alert';
import * as _ from 'lodash';
import { Tags } from 'models';
import * as React from 'react';
import Editor from './Editor';

interface Props {
    value: Tags;
    readOnly?: boolean;
    onChange(tags: Tags);
}

export default function TagEditor(props: Props) {
    return (
        <React.Fragment>
            {Object.keys((props.value || {})).map(key => (
                props.readOnly
                    ? (
                        <Chip
                            key={key}
                            style={{ margin: 5 }}
                            variant="outlined"
                            label={`${key}=${props.value[key]}`}
                        />
                    )
                    : (
                        <Chip
                            key={key}
                            style={{ margin: 5 }}
                            variant="outlined"
                            label={`${key}=${props.value[key]}`}
                            onClick={() => {
                                Editor.present(key, props.value[key], true)
                                    .then(({ key, value }) => {
                                        const tags = props.value;
                                        tags[key] = value;
                                        props.onChange(tags);
                                    });
                            }}
                            onDelete={() => {
                                Alert.present(
                                    'Are you sure',
                                    (
                                        <DialogContentText>
                                            Are you sure to delete tag "{key}={props.value[key]}"?
                                        </DialogContentText>
                                    ),
                                ).then((flag) => {
                                    if (!flag) return;
                                    const tags = _.omit(props.value, key);
                                    props.onChange(tags);
                                });
                            }}
                        />
                    )
            ))}
            {!props.readOnly
                && (
                    <Chip
                        color="primary"
                        label="ADD"
                        onClick={() => {
                            Editor.present('', '')
                                .then(({ key, value }) => {
                                    const tags = props.value || {};
                                    if (key in tags) {
                                        return;
                                    }
                                    tags[key] = value;
                                    props.onChange(tags);
                                });
                        }}
                    />
                )
            }
        </React.Fragment>
    );
}
