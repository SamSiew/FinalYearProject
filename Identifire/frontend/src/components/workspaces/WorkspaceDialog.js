import React, { useState } from 'react'
import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { CirclePicker } from 'react-color'

import styles from './WorkspaceDialog.module.css'

// This component is a resuable component that allows users to update / create a workspace

const defaultColour = '#f44336'

export default function WorkspaceDialog({
    title,
    text,
    errors,
    loading,
    open,
    onClose,
    resetOnCancel, 
    workspaceName: workspaceNameProps,
    workspaceColour: workspaceColourProps,
    submitText,
    onSubmit,
    onCancel,
}) {
    const initialWorkspaceName = workspaceNameProps ?? ''
    const initialWorkspaceColour = workspaceColourProps ?? defaultColour
    const [workspaceName, setWorkspaceName] = useState({
        value: initialWorkspaceName,
        error: false
    })
    const [workspaceColour, setWorkspaceColour] = useState(initialWorkspaceColour)

    const handleWorkspaceNameChange = (event) => {
        setWorkspaceName({
            value: event.target.value,
            error: false
        })
    }

    const handleWorkspaceColourChange = (colour, event) => {
        setWorkspaceColour(colour.hex)
    }

    const handleCancel = () => {
        if (resetOnCancel) {
            setWorkspaceName({
                value: initialWorkspaceName,
                error: false
            })
            setWorkspaceColour(initialWorkspaceColour)
        }
        onCancel()
    }

    const handleSubmit = () => {
        if (workspaceName.value.length === 0) {
            setWorkspaceName({
                value: workspaceName.value,
                error: 'Workspace name cannot be empty!'
            })
        } else {
            onSubmit({
                workspaceName: workspaceName.value,
                workspaceColour
            })
        }
    }

    return (
        <Dialog 
            open={open} 
            aria-labelledby="form-dialog-title"
            fullWidth={true}
            maxWidth="sm"
            onClose={onClose}
        >
            <DialogTitle id="form-dialog-title">{title}</DialogTitle>
            <DialogContent className={styles.dialogContent}>
                { errors &&
                    <Alert severity="error">
                        {errors.map((err, index) => (
                            <Typography
                                key={index}
                                variant="body1"
                            >
                                {err.msg}
                            </Typography>
                        ))}
                    </Alert>
                }
                <DialogContentText>
                    {text}
                </DialogContentText>
                <TextField 
                    autoFocus
                    label="Workspace name"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    value={workspaceName.value}
                    onChange={handleWorkspaceNameChange}
                    error={workspaceName.error}
                    helperText={workspaceName.error}
                />
                <div className={styles.colourContainer}>
                    <Typography variant="subtitle1" className={styles.colourText}>
                        Please select a colour for your workspace!
                    </Typography>
                    <CirclePicker 
                        onChangeComplete={handleWorkspaceColourChange}
                        color={workspaceColour}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button 
                    variant="outlined"
                    className={styles.cancelButton} 
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button 
                    className={styles.submitButton}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {submitText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}