import React from 'react'
import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core'

import styles from './WorkspaceDeleteConfirmation.module.css'

// This component allows users to conform that they want to delete their workspace

export default function WorkspaceDeleteConfirmation({
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
            <DialogTitle>{"Delete this workspace?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this workspace? This <strong>cannot be undone</strong>.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancel} className={styles.cancelButton}>Cancel</Button>
                    <Button onClick={onConfirm} className={styles.confirmDeleteButton}>Delete</Button>
                </DialogActions>
        </Dialog>
    )
}