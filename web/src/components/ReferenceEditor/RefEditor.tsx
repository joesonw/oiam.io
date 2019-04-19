import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@material-ui/core';
import toModal from 'components/toModal';
import {
    ObjectWithMetadata,
    Ref,
} from 'models';
import * as React from 'react';

interface Props {
    onClose(ref: Ref): void;
    value: Ref;
    namespaces: string[];
    kinds: string[];
    lister(kind: string, namespace: string): Promise<ObjectWithMetadata[]>;
}

interface State {
    namespace: string;
    name: string;
    kind: string;
    names: string[];
}

export default class RefEditor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        let { namespace } = props.value;
        let { kind } = props.value;

        if (props.namespaces.length === 1) {
            namespace = props.namespaces[0];
        }

        if (props.kinds.length === 1) {
            kind = props.kinds[0];
        }

        this.state = {
            namespace,
            kind,
            name: props.value.name,
            names: [],
        };
    }

    static present(
        value: Ref,
        namespaces: string[],
        kinds: string[],
        lister: (kind: string, namespace: string) => Promise<ObjectWithMetadata[]>,
    ): Promise<Ref> {
        return toModal(r => (
            <RefEditor
                onClose={r}
                value={value}
                namespaces={namespaces}
                kinds={kinds}
                lister={lister}
            />
        ));
    }

    load(namespace: string, kind: string) {
        return this.props.lister(kind, namespace)
            .then((objs) => {
                const state: any = {
                    names: objs.map(o => o.metadata.name),
                };
                if (state.names.length === 1) {
                    state.name = state.names[0];
                }
                this.setState(state);
            });
    }

    componentDidMount() {
        this.load(this.state.namespace, this.state.kind);
    }

    render() {
        const { namespace, kind, name } = this.state;

        return (
            <Dialog
                open
                onClose={() => this.props.onClose({
                    namespace: this.props.value.namespace,
                    name: this.props.value.name,
                    kind: this.props.value.kind,
                })}
            >
                <DialogContent>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="ref-editor-field-namespace">Namespace</InputLabel>
                        <Select
                            id="ref-editor-field-namespace"
                            value={namespace}
                            onChange={(e) => {
                                this.setState({
                                    namespace: e.target.value,
                                    name: '',
                                    kind: '',
                                });
                            }}
                        >
                            {
                                this.props.namespaces.map(namespace => (
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
                    <FormControl fullWidth>
                        <InputLabel htmlFor="ref-editor-field-kind">Kind</InputLabel>
                        <Select
                            id="ref-editor-field-kind"
                            value={kind}
                            onChange={(e) => {
                                this.setState({
                                    kind: e.target.value,
                                    name: '',
                                });
                                this.load(namespace, e.target.value);
                            }}
                        >
                            {
                                this.props.kinds.map(kind => (
                                    <MenuItem
                                        key={kind}
                                        value={kind}
                                    >
                                        {kind}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="ref-editor-field-name">Name</InputLabel>
                        <Select
                            id="ref-editor-field-name"
                            value={name}
                            onChange={(e) => {
                                this.setState({
                                    name: e.target.value,
                                });
                            }}
                        >
                            {
                                this.state.names.map(name => (
                                    <MenuItem
                                        key={name}
                                        value={name}
                                    >
                                        {name}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="default"
                        onClick={() => this.props.onClose(this.props.value)}
                    >
                        CANCEL
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => this.props.onClose({
                            namespace,
                            kind,
                            name,
                        })}
                    >
                        SAVE
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
