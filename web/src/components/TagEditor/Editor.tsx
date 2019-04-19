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
import * as React from 'react';

interface Props {
    keyReadOnly: boolean;
    onClose(flag: { key: string; value: string }): void;
    tagKey: string;
    tagValue: string;
}

interface State {
    key: string;
    value: string;
}

export default class Editor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            key: props.tagKey,
            value: props.tagValue,
        };
    }

    static present(
        key: string,
        value: string,
        keyReadOnly = false,
    ): Promise<{ key: string; value: string }> {
        return toModal(r => (
            <Editor
                keyReadOnly={keyReadOnly}
                onClose={r}
                tagKey={key}
                tagValue={value}
            />
        ));
    }

    render() {
        return (
            <Dialog
                open
                onClose={() => this.props.onClose({ key: this.props.tagKey, value: this.props.tagValue })}
            >
                <DialogContent>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="metadata-editor-tag-editor-key">Key</InputLabel>
                        <Input
                            disabled={this.props.keyReadOnly}
                            id="metadata-editor-tag-editor-key"
                            value={this.state.key}
                            onChange={(e) => {
                                this.setState({
                                    key: e.target.value,
                                });
                            }}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="metadata-editor-tag-editor-value">Value</InputLabel>
                        <Input
                            id="metadata-editor-tag-editor-value"
                            value={this.state.value}
                            onChange={(e) => {
                                this.setState({
                                    value: e.target.value,
                                });
                            }}
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="default"
                        onClick={() => this.props.onClose({ key: this.props.tagKey, value: this.props.tagValue })}
                    >
                        CANCEL
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => this.props.onClose({ key: this.state.key, value: this.state.value })}
                    >
                        SAVE
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
