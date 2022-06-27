import React from 'react'
import { 
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core'

import styles from './VisualisationDeleteConfirmation.module.css'

export default function VisualisationDeleteConfirmation({
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
            <DialogTitle>{"Delete this measurement?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this measurement? This <strong>cannot be undone</strong>.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancel} className={styles.cancelButton}>Cancel</Button>
                    <Button onClick={onConfirm} className={styles.confirmDeleteButton}>Delete</Button>
                </DialogActions>
        </Dialog>
    )
}