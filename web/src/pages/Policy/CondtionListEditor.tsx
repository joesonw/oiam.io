import {
    Card,
    CardContent,
    Chip,
    DialogContentText,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@material-ui/core';
import {
    Add,
    CloseRounded,
} from '@material-ui/icons';
import Alert from 'components/Alert';
import Prompt from 'components/Prompt';
import * as _ from 'lodash';
import {
    Condition,
} from 'models';
import * as React from 'react';

interface Props extends React.Props<void> {
    readOnly?: boolean;
    value: Condition;
    onChange(condition: Condition): void;
}

const BUTTON_STYLE = {
    padding: 0,
    margin: 0,
    fontSize: '.5rem',
};

const ICON_STYLE = {
    padding: 0,
    margin: 0,
};

export default function CondtionListEditor(props: Props) {
    return (
        <React.Fragment>
            {Object.keys(props.value).map((key, i) => {
                const params = _.clone(props.value[key]);
                const paramKeys = Object.keys(params);
                return (
                    <Card
                        key={key}
                        style={{
                            marginTop: i !== 0 ? 5 : 0,
                        }}
                    >
                        <CardContent>
                            <List
                                subheader={(
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography style={{ display: 'inline-block' }}>{key}</Typography>
                                        {!props.readOnly
                                            && (
                                                <IconButton
                                                    style={BUTTON_STYLE}
                                                    onClick={() => {
                                                        Alert.present(
                                                            'Are you sure',
                                                            (
                                                                <DialogContentText>
                                                                    Are you sure to delete tag "{key}"?
                                                                </DialogContentText>
                                                            ),
                                                        ).then((flag) => {
                                                            if (!flag) return;
                                                            props.onChange(_.omit(props.value, key));
                                                        });
                                                    }}
                                                    disableRipple
                                                >
                                                    <CloseRounded color="secondary" style={ICON_STYLE} />
                                                </IconButton>
                                            )
                                        }
                                        {!props.readOnly
                                            && (
                                                <IconButton
                                                    style={BUTTON_STYLE}
                                                    onClick={() => {
                                                        Prompt.present('Enter a name')
                                                            .then((paramKey) => {
                                                                if (!paramKey) return;
                                                                props.onChange({
                                                                    ...props.value,
                                                                    [key]: {
                                                                        ...params,
                                                                        [paramKey]: [],
                                                                    },
                                                                });
                                                            });
                                                    }}
                                                    disableRipple
                                                >
                                                    <Add style={ICON_STYLE} />
                                                </IconButton>
                                            )
                                        }
                                    </div>
                                )}
                            >
                                {paramKeys.map(paramKey => (
                                    <ListItem key={paramKey}>
                                        <ListItemIcon>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {!props.readOnly
                                                    && (
                                                        <IconButton
                                                            style={BUTTON_STYLE}
                                                            onClick={() => {
                                                                Alert.present(
                                                                    'Are you sure',
                                                                    (
                                                                        <DialogContentText>
                                                                            Are you sure to delete tag "{paramKey}"?
                                                                        </DialogContentText>
                                                                    ),
                                                                ).then((flag) => {
                                                                    if (!flag) return;
                                                                    props.onChange({
                                                                        ...props.value,
                                                                        [key]: _.omit(params, paramKey),
                                                                    });
                                                                });
                                                            }}
                                                            disableRipple
                                                        >
                                                            <CloseRounded color="secondary" style={ICON_STYLE} />
                                                        </IconButton>
                                                    )
                                                }
                                                <Typography style={{ display: 'inline-block' }} color="primary">
                                                    {paramKey}
                                                </Typography>
                                            </div>
                                        </ListItemIcon>
                                        <ListItemText>
                                            {params[paramKey].map((val, i) => (
                                                props.readOnly
                                                    ? (
                                                        <Chip
                                                            key={i}
                                                            style={{ margin: 5 }}
                                                            variant="outlined"
                                                            label={val}
                                                        />
                                                    )
                                                    : (
                                                        <Chip
                                                            key={i}
                                                            style={{ margin: 5 }}
                                                            variant="outlined"
                                                            label={val}
                                                            onDelete={() => {
                                                                Alert.present(
                                                                    'Are you sure',
                                                                    (
                                                                        <DialogContentText>
                                                                            Are you sure to delete tag "{val}"?
                                                                        </DialogContentText>
                                                                    ),
                                                                ).then((flag) => {
                                                                    if (!flag) return;
                                                                    const vals = params[paramKey].slice();
                                                                    vals.splice(i, 1);
                                                                    props.onChange({
                                                                        ...props.value,
                                                                        [key]: {
                                                                            ...params,
                                                                            [paramKey]: vals,
                                                                        },
                                                                    });
                                                                });
                                                            }}
                                                        />
                                                    )
                                            ))}
                                            {!props.readOnly
                                                && (
                                                    <IconButton
                                                        style={BUTTON_STYLE}
                                                        onClick={() => {
                                                            Prompt.present('Enter a name')
                                                                .then((val) => {
                                                                    if (!val) return;
                                                                    const vals = params[paramKey].slice();
                                                                    vals.push(val);
                                                                    props.onChange({
                                                                        ...props.value,
                                                                        [key]: {
                                                                            ...params,
                                                                            [paramKey]: vals,
                                                                        },
                                                                    });
                                                                });
                                                        }}
                                                        disableRipple
                                                    >
                                                        <Add style={ICON_STYLE} />
                                                    </IconButton>
                                                )
                                            }
                                        </ListItemText>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                );
            })}
        </React.Fragment>
    );
}
