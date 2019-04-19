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
    onClose(value: string): void;
    title: string;
}

interface State {
    value: string;
    id: string;
}

export default class Prompt extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: '',
            id: `prompt-${Date.now().toString()}`,
        };
    }

    static present(title: string): Promise<string> {
        return toModal(r => (
            <Prompt
                onClose={r}
                title={title}
            />
        ));
    }

    render() {
        return (
            <Dialog
                open
                onClose={() => this.props.onClose(this.state.value)}
            >
                <DialogContent>
                    <FormControl fullWidth>
                        <InputLabel htmlFor={this.state.id}>{this.props.title}</InputLabel>
                        <Input
                            id={this.state.id}
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
                        color="primary"
                        onClick={() => this.props.onClose(this.state.value)}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
