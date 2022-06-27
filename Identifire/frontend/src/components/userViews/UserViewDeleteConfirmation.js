import React from 'react'
import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core'

import styles from './UserViewDeleteConfirmation.module.css'

// This component is a confirmation dialog used to confirm that users want to delete their view

export default function UserViewDeleteConfirmation({
    open,
    onConfirm,
    onClose,
    onCancel
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle>{"Delete this view?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this view? This <strong>cannot be undone</strong>.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancel} className={styles.cancelButton}>Cancel</Button>
                    <Button onClick={onConfirm} className={styles.confirmDeleteButton}>Delete</Button>
                </DialogActions>
        </Dialog>
    )
}