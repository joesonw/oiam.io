import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Input,
    InputLabel,
    Typography,
} from '@material-ui/core';
import MetadataEditor from 'components/MetadataEditor';
import * as _ from 'lodash';
import {
    Namespace,
    Metadata,
} from 'models';
import {
    withSnackbar,
    withSnackbarProps,
} from 'notistack';
import * as React from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';

type ExtraProps = Partial<RouteComponentProps> & Partial<withSnackbarProps>;

interface Props extends ExtraProps {
    insert?: boolean;
    readOnly?: boolean;
    open?: boolean;
    value: Namespace;
    onClose(): void;
    onSubmit(value: Namespace): void;
    namespaces: string[];
}

interface State {
    description: string;
    metadata: Metadata;
}

const $withSnackbar = withSnackbar as any;
const $withRouter = withRouter as any;

@$withRouter
@$withSnackbar
export default class Form extends React.Component<Props, State> {
    state = {
        description: '',
        metadata: {},
    };

    constructor(props: Props) {
        super(props);
        if (props.value) {
            this.state = {
                description: props.value.description,
                metadata: props.value.metadata,
            };
        }
    }

    handleClose = () => {
        this.props.onClose();
    }

    handleSave = () => {
        this.props.onSubmit({
            description: this.state.description,
            metadata: this.state.metadata,
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (!_.isEqual(prevProps.value, this.props.value)) {
            this.setState({
                description: this.props.value.description,
                metadata: this.props.value.metadata,
            });
        }
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.handleClose}
                disableBackdropClick={!this.props.readOnly}
            >
                <DialogTitle>Namespace</DialogTitle>
                <DialogContent>
                    <Card>
                        <CardContent>
                            <Typography color="default">Namespace</Typography>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="namespace-editor-field-description">Description</InputLabel>
                                <Input
                                    multiline
                                    rowsMax={3}
                                    disabled={this.props.readOnly}
                                    id="namespace-editor-field-description"
                                    value={this.state.description}
                                    onChange={e => this.setState({ description: e.target.value })}
                                />
                            </FormControl>
                        </CardContent>
                    </Card>
                    <Divider style={{ margin: '20px 0' }} />
                    <Card>
                        <CardContent>
                            <Typography color="default">Metadata</Typography>
                            <MetadataEditor
                                readOnly={this.props.readOnly}
                                insert={this.props.insert}
                                value={this.state.metadata}
                                onChange={metadata => this.setState({ metadata })}
                                namespaces={[]}
                                disableNamespace
                            />
                        </CardContent>
                    </Card>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.onClose} color="default">Close</Button>
                    {!this.props.readOnly
                        && (
                            <Button onClick={this.handleSave} color="primary">
                                {this.props.insert ? 'Create' : 'Save'}
                            </Button>
                        )
                    }
                </DialogActions>
            </Dialog>
        );
    }
}
