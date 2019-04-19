import {
    Card,
    CardContent,
    FormControl,
    Input,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from '@material-ui/core';
import TagEditor from 'components/TagEditor';
import { Metadata } from 'models';
import * as React from 'react';


interface Props {
    insert?: boolean;
    readOnly?: boolean;
    value: Metadata;
    namespaces: string[];
    onChange(value: Metadata);
    disableNamespace?: boolean;
}

export default function MetadataEditor(props: Props) {
    return (
        <React.Fragment>
            <FormControl fullWidth>
                <InputLabel htmlFor="metadata-editor-field-name">Name</InputLabel>
                <Input
                    disabled={props.readOnly || !props.insert}
                    id="metadata-editor-field-name"
                    value={props.value.name || ''}
                    onChange={(e) => {
                        props.onChange({
                            ...props.value,
                            name: e.target.value,
                        });
                    }}
                />
            </FormControl>
            {!props.disableNamespace
            && (
                <FormControl fullWidth>
                    <InputLabel htmlFor="metadata-editor-field-namespace">Namespace</InputLabel>
                    <Select
                        disabled={props.readOnly}
                        id="metadata-editor-field-namespace"
                        value={props.value.namespace || ''}
                        onChange={(e) => {
                            props.onChange({
                                ...props.value,
                                namespace: e.target.value,
                            });
                        }}
                    >
                        {
                            props.namespaces.map(namespace => (
                                <MenuItem
                                    key={namespace}
                                    value={namespace}
                                >
                                    {namespace}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            )}
            <FormControl fullWidth>
                <InputLabel htmlFor="metadata-editor-field-kind">Kind</InputLabel>
                <Input
                    id="metadata-editor-field-kind"
                    value={props.value.kind || ''}
                    disabled
                />
            </FormControl>
            <FormControl fullWidth style={{ margin: '10px 0' }}>
                <Card>
                    <CardContent>
                        <Typography style={{ marginBottom: 10 }}>Tags</Typography>
                        <TagEditor
                            readOnly={props.readOnly}
                            value={props.value.tags}
                            onChange={tags => props.onChange({ ...props.value, tags })}
                        />
                    </CardContent>
                </Card>
            </FormControl>
            <FormControl fullWidth>
                <InputLabel htmlFor="metadata-editor-field-uid">UID</InputLabel>
                <Input
                    id="metadata-editor-field-uid"
                    value={props.value.uid || ''}
                    disabled
                />
            </FormControl>
            <FormControl fullWidth>
                <InputLabel htmlFor="metadata-editor-field-version">Version</InputLabel>
                <Input
                    id="metadata-editor-field-version"
                    value={props.value.version || ''}
                    disabled
                />
            </FormControl>
            <FormControl fullWidth>
                <InputLabel htmlFor="metadata-editor-field-created-at">Created At</InputLabel>
                <Input
                    id="metadata-editor-field-created-at"
                    value={props.value.createdAt || ''}
                    disabled
                />
            </FormControl>
            <FormControl fullWidth>
                <InputLabel htmlFor="metadata-editor-field-updated-at">Updated At</InputLabel>
                <Input
                    id="metadata-editor-field-updated-at"
                    value={props.value.updatedAt || ''}
                    disabled
                />
            </FormControl>
            <FormControl fullWidth>
                <InputLabel htmlFor="metadata-editor-field-deleted-at">Deleted At</InputLabel>
                <Input
                    id="metadata-editor-field-deleted-at"
                    value={props.value.deletedAt || 'null'}
                    disabled
                />
            </FormControl>
        </React.Fragment>
    );
}
