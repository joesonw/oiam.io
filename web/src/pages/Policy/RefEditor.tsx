import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    Input,
    InputLabel,
} from '@material-ui/core';
import toModal from 'components/toModal';
import {
    Ref,
} from 'models';
import * as React from 'react';

interface Props {
    onClose(ref: Ref): void;
    value: Ref;
}

interface State {
    namespace: string;
    name: string;
    kind: string;
}

export default class RefEditor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            namespace: props.value.namespace || '',
            name: props.value.name || '',
            kind: props.value.kind || '',
        };
    }

    static present(value: Ref): Promise<Ref> {
        return toModal(r => (
            <RefEditor
                onClose={r}
                value={value}
            />
        ));
    }

    render() {
        return (
            <Dialog
                open
                onClose={() => this.props.onClose({
                    namespace: this.state.namespace,
                    name: this.state.name,
                    kind: this.state.kind,
                })
                }
            >
                <DialogContent>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="wildref-editor-field-namespace">Namespace</InputLabel>
                        <Input
                            id="wildref-editor-field-namespace"
                            value={this.state.namespace}
                            onChange={(e) => {
                                this.setState({
                                    namespace: e.target.value,
                                });
                            }}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="wildref-editor-field-kind">Kind</InputLabel>
                        <Input
                            id="wildref-editor-field-kind"
                            value={this.state.kind}
                            onChange={(e) => {
                                this.setState({
                                    kind: e.target.value,
                                });
                            }}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="wildref-editor-field-name">Name</InputLabel>
                        <Input
                            id="wildref-editor-field-name"
                            value={this.state.name}
                            onChange={(e) => {
                                this.setState({
                                    name: e.target.value,
                                });
                            }}
                        />
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
                            namespace: this.state.namespace,
                            kind: this.state.kind,
                            name: this.state.name,
                        })}
                    >
                        SAVE
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
