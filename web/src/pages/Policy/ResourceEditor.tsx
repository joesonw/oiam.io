import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    Input,
    InputLabel,
    Typography,
} from '@material-ui/core';
import TagEditor from 'components/TagEditor';
import toModal from 'components/toModal';
import {
    Resource, Tags,
} from 'models';
import * as React from 'react';

interface Props {
    readOnly?: boolean;
    onClose(ref: Resource): void;
    value: Resource;
}

interface State {
    namespace: string;
    name: string;
    kind: string;
    tags: Tags;
}

export default class ResourceEditor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            namespace: props.value.namespace || '',
            name: props.value.name || '',
            kind: props.value.kind || '',
            tags: props.value.tags || {},
        };
    }

    static present(value: Resource, readOnly?: boolean): Promise<Resource> {
        return toModal(r => (
            <ResourceEditor
                onClose={r}
                readOnly={readOnly}
                value={value}
            />
        ));
    }

    render() {
        return (
            <Dialog
                open
                onClose={() => this.props.onClose({
                    namespace: this.props.value.namespace,
                    name: this.props.value.name,
                    kind: this.props.value.kind,
                    tags: this.props.value.tags,
                })
                }
            >
                <DialogContent>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="resource-editor-field-namespace">Namespace</InputLabel>
                        <Input
                            id="resource-editor-field-namespace"
                            value={this.state.namespace}
                            onChange={(e) => {
                                this.setState({
                                    namespace: e.target.value,
                                });
                            }}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="resource-editor-field-kind">Kind</InputLabel>
                        <Input
                            id="resource-editor-field-kind"
                            value={this.state.kind}
                            onChange={(e) => {
                                this.setState({
                                    kind: e.target.value,
                                });
                            }}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel htmlFor="resource-editor-field-name">Name</InputLabel>
                        <Input
                            id="resource-editor-field-name"
                            value={this.state.name}
                            onChange={(e) => {
                                this.setState({
                                    name: e.target.value,
                                });
                            }}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <Card>
                            <Typography>Tags</Typography>
                            <CardContent>
                                <TagEditor
                                    readOnly={this.props.readOnly}
                                    value={this.state.tags}
                                    onChange={tags => this.setState({ tags })}
                                />
                            </CardContent>
                        </Card>
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
                            tags: this.state.tags,
                        })}
                    >
                        SAVE
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
