import React, { useEffect, useState } from 'react'
import { 
    Button,
    Snackbar,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import WorkspaceDialog from './WorkspaceDialog'
import { useLazyApi } from '../../hooks/auth'

import styles from './CreateWorkspaceButton.module.css'

// This component is a button that when clicked will launch a create workspace dialog,
// allowing users to create workspaces

export default function CreateWorkspaceButton({children, onCreate}) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [createWorkspace, { loading, error, data }] = useLazyApi('/api/workspaces', {
        requestOptions: {
            method: 'POST',
            headers : {
                'Content-Type': 'application/json'
            }
        }
    })

    useEffect(() => {
        if (!loading && data) {
            setSnackbarOpen(true)
            setDialogOpen(false)
            onCreate({
                workspaceId: data.workspaceId,
                workspaceName: data.workspaceName,
                workspaceColour: data.workspaceColour
            })
        }
    }, [loading, data])
   
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return 
        } else {
            setSnackbarOpen(false)
        }
    }

    const handleCreate = ({ workspaceName, workspaceColour }) => {
        createWorkspace({
            body: JSON.stringify({
                workspaceName,
                workspaceColour
            })
        })
    }

    return (
        <div>
            <Button 
                variant="contained"
                className={styles.workspaceButton}
                onClick={() => setDialogOpen(true)}
            >
                {children}
            </Button>
            <WorkspaceDialog 
                title="Create your workspace!"
                text="Please fill our the details below for your brand new workspace!"
                errors={error?.errors}
                loading={loading}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                resetOnCancel={true}
                submitText="Create"
                onSubmit={handleCreate}
                onCancel={() => setDialogOpen(false)}
            />
            <Snackbar
                open={snackbarOpen}
                anchorOrigin={{ vertical: 'top', horizontal: 'right'}}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity="success">
                    Created new workspace! {' '} 
                    <span role="img" aria-label="celebrate">🎉</span>
                </Alert>
            </Snackbar>
        </div>
    )
}