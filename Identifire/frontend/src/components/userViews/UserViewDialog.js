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

import styles from './UserViewDialog.module.css'

// This component is a resuable dialog that allows users to create / update their user view.

export default function UserViewDialog ({
    title,
    text,
    errors,
    loading,
    open,
    onClose,
    resetOnCancel, 
    viewName: viewNameProps,
    submitText,
    onSubmit,
    onCancel,
}) {
    if (errors) { console.log(errors)}
    const initialViewName = viewNameProps ?? ''
    const [viewName, setViewName] = useState({
        value: initialViewName,
        error: false
    })

    const handleViewNameChange = (event) => {
        setViewName({
            value: event.target.value,
            error: false
        })
    }

    const handleCancel = () => {
        if (resetOnCancel) {
            setViewName({
                value: initialViewName,
                error: false
            })
        }
        onCancel()
    }

    const handleSubmit = () => {
        if (viewName.value.length === 0) {
            setViewName({
                value: viewName.value,
                error: 'View name cannot be empty!'
            })
        } else {
            onSubmit({
                viewName: viewName.value,
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
                    label="View name"
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    value={viewName.value}
                    onChange={handleViewNameChange}
                    error={viewName.error}
                    helperText={viewName.error}
                />
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