import {
    Button,
    Card,
    CardContent,
    DialogContentText,
    FilledInput,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core';
import parseSearch from 'common/parseSearch';
import Alert from 'components/Alert';
import * as _ from 'lodash';
import {
    Namespace,
    ObjectWithMetadata,
} from 'models';
import {
    withSnackbar,
    withSnackbarProps,
} from 'notistack';
import * as React from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import NamespaceService from 'services/NamespaceService';

type ExtraProps = Partial<RouteComponentProps> & Partial<withSnackbarProps>;

interface FormProps<T> {
    insert?: boolean;
    readOnly?: boolean;
    open?: boolean;
    namespaces: string[];
    value: T;
    onClose(): void;
    onSubmit(value: T): void;
}

interface Props<T> extends ExtraProps {
    name: string;
    disableNamespace?: boolean;
    formClass: React.JSXElementConstructor<FormProps<T>>;
    onList(namespace: string): Promise<T[]>;
    onSave(data: T): Promise<T>;
    onRemove(data: T): Promise<void>;
    onNew(): T;
}

interface State<T> {
    namespaces: Namespace[];
    list: T[];
    namespace: string;
    editorValue: T;
    isEditorOpen: boolean;
    isEditorInsert: boolean;
    isEditorReadOnly: boolean;
}

const $withSnackbar = withSnackbar as any;
const $withRouter = withRouter as any;

@$withRouter
@$withSnackbar
export default class ResourceList<T extends ObjectWithMetadata> extends React.Component<Props<T>, State<T>> {
    state = {
        namespaces: [],
        list: [],
        namespace: '',
        editorValue: {} as any,
        isEditorOpen: false,
        isEditorInsert: false,
        isEditorReadOnly: false,
    };

    componentDidMount() {
        let target = '';
        let handler: (editorValue: T) => () => void = null;
        let value: T = null;

        this.loadList().then(() => {
            const query = parseSearch(this.props.location.search);
            if (query.view) {
                target = query.view;
                handler = this.handleShowReadOnly;
            } else if (query.edit) {
                target = query.edit;
                handler = this.handleShowEditor;
            }

            if (handler && !this.props.disableNamespace) {
                return this.loadFromNamespace(target.split('/')[0]);
            }
            return Promise.resolve();
        }).then(() => {
            if (handler) {
                const parts = target.split('/');
                if (this.props.disableNamespace) {
                    value = this.state.list.find(a => a.metadata.name === parts[0]);
                } else {
                    // eslint-disable-next-line max-len
                    value = this.state.list.find(a => a.metadata.namespace === parts[0] && a.metadata.name === parts[1]);
                }
            }

            if (handler) {
                if (value) {
                    handler(value)();
                } else {
                    // eslint-disable-next-line max-len
                    this.props.enqueueSnackbar(` unable to find ${this.props.name} ${target}`, { variant: 'error' });
                }
            }
        });
    }

    loadList() {
        if (this.props.disableNamespace) {
            return this.loadFromNamespace('')
                .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
        }
        return NamespaceService.list()
            .then((namespaces) => {
                this.setState({ namespaces });
                if (namespaces.length > 0) {
                    return this.loadFromNamespace(namespaces[0].metadata.name);
                }
            })
            .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
    }

    loadFromNamespace(namespace: string) {
        this.setState(() => ({
            namespace,
        }));
        return this.props.onList(namespace)
            .then(list => this.setState({ list }))
            .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
    }

    handleChangeNamespace = (e: React.ChangeEvent<HTMLSelectElement>) => this.loadFromNamespace(e.target.value)

    handleSave = (data: T) => {
        this.props.onSave(data)
            .then((saved) => {
                // eslint-disable-next-line max-len
                this.props.enqueueSnackbar(`${this.props.name} ${saved.metadata.namespace}/${saved.metadata.name} is now version ${saved.metadata.version}`, { variant: 'success' });
                this.setState({
                    isEditorOpen: false,
                });
                this.loadList();
            })
            .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
    }

    handleDelete(data: T) {
        return () => {
            const meta = data.metadata;
            Alert.present(
                'Are you sure?',
                (
                    <DialogContentText>
                        Are you sure to delete {this.props.name} "{meta.namespace}/{meta.name}"?
                    </DialogContentText>
                ),
            )
                .then((flag) => {
                    if (!flag) return;
                    return this.props.onRemove(data)
                        .then(() => {
                            // eslint-disable-next-line max-len
                            this.props.enqueueSnackbar(`{this.props.name} ${meta.namespace}/${meta.name} is removed`, { variant: 'success' });
                            return this.loadList();
                        });
                })
                .catch(e => this.props.enqueueSnackbar(e.message, { variant: 'error' }));
        };
    }

    handleShowInsertEditor = () => {
        const editorValue = this.props.onNew();
        if (this.state.namespace && this.state.namespace !== '*') {
            editorValue.metadata = editorValue.metadata || {};
            editorValue.metadata.namespace = this.state.namespace;
        }
        this.setState({
            editorValue,
            isEditorInsert: true,
            isEditorOpen: true,
            isEditorReadOnly: false,
        });
    }

    handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.setAttribute('style', 'display:none');
        input.onchange = () => {
            const { files } = input;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result as string);
                    const item = this.props.onNew();
                    const { metadata } = item;
                    delete item.metadata;
                    if (data && data.metadata) {
                        metadata.namespace = data.metadata.namespace;
                        metadata.name = data.metadata.name;
                    }

                    this.setState({
                        isEditorInsert: true,
                        isEditorOpen: true,
                        isEditorReadOnly: false,
                        editorValue: {
                            ...item,
                            ...(_.omit(data, 'metadata')),
                            metadata,
                        },
                    });
                } catch (e) {
                    console.error(e);
                    Alert.present('Unable to import', e.message);
                }
            };
            reader.readAsText(files[0]);
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    handleShowReadOnly = (editorValue: T) => () => {
        this.setState({
            editorValue,
            isEditorInsert: false,
            isEditorOpen: true,
            isEditorReadOnly: true,
        });
    }

    handleShowEditor = (editorValue: T) => () => {
        this.setState({
            editorValue,
            isEditorInsert: false,
            isEditorOpen: true,
            isEditorReadOnly: false,
        });
    }

    handleExport = (item: T) => () => {
        const str = JSON.stringify(item, null, 4);
        const a = document.createElement('a');
        a.href = `data:text/json;charset=utf-8,${encodeURIComponent(str)}`;
        const parts = [item.metadata.kind, item.metadata.namespace, item.metadata.name];
        a.download = `${parts.filter(s => !!s).join('_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    render() {
        const Form = this.props.formClass;
        return (
            <Paper>
                <div
                    style={{
                        padding: 20,
                    }}
                >
                    <Typography>{this.props.name} List</Typography>
                    {!this.props.disableNamespace
                    && (
                        <FormControl variant="standard" style={{ width: 200 }}>
                            <InputLabel htmlFor="namespace-picker">Namespace</InputLabel>
                            <Select
                                value={this.state.namespace}
                                onChange={this.handleChangeNamespace}
                                input={<FilledInput id="namespace-picker" />}
                            >
                                <MenuItem value="*">*</MenuItem>
                                {
                                    this.state.namespaces.map(namespace => (
                                        <MenuItem
                                            key={namespace.metadata.name}
                                            value={namespace.metadata.name}
                                        >
                                            {namespace.metadata.name}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    )}
                    <Card>
                        <CardContent>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {!this.props.disableNamespace && (<TableCell>Namespace</TableCell>)}
                                        <TableCell>Name</TableCell>
                                        <TableCell>Updated At</TableCell>
                                        <TableCell>Version</TableCell>
                                        <TableCell>
                                            <Button color="primary" onClick={this.handleShowInsertEditor}>
                                                Add
                                            </Button>
                                            <Button onClick={this.handleImport}>
                                                Import
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.list.map(item => (
                                        <TableRow key={`${item.metadata.namespace}-${item.metadata.name}`}>
                                            {!this.props.disableNamespace && (<TableCell>{item.metadata.namespace}</TableCell>)}
                                            <TableCell>{item.metadata.name}</TableCell>
                                            <TableCell>{item.metadata.updatedAt}</TableCell>
                                            <TableCell>{item.metadata.version}</TableCell>
                                            <TableCell>
                                                <Button color="default" onClick={this.handleShowReadOnly(item)}>
                                                    View
                                                </Button>
                                                <Button color="primary" onClick={this.handleShowEditor(item)}>
                                                    Edit
                                                </Button>
                                                <Button color="secondary" onClick={this.handleDelete(item)}>
                                                    Delete
                                                </Button>
                                                <Button onClick={this.handleExport(item)}>
                                                    Export
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <Form
                    insert={this.state.isEditorInsert}
                    open={this.state.isEditorOpen}
                    readOnly={this.state.isEditorReadOnly}
                    namespaces={this.state.namespaces.map(ns => ns.metadata.name)}
                    value={this.state.editorValue}
                    onClose={() => this.setState({ isEditorOpen: false })}
                    onSubmit={this.handleSave}
                />
            </Paper>
        );
    }
}
