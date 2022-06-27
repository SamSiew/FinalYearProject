import React, { useState } from 'react'
import { 
    List, 
    CircularProgress, 
    Typography } from '@material-ui/core'
import { useAuth0 } from '@auth0/auth0-react'
import { LoginButton } from '../auth/UserAuth'
import CreateWorkspaceButton from './CreateWorkspaceButton'
import WorkspaceListItem from './WorkspaceListItem'
import { ReactComponent as PlaceholderImage } from './assets/workspaceCampfire.svg';

import styles from './WorkspaceList.module.css'

// This component represents the list of workspaces in the workspaces drawer

export default function WorkspaceList({ 
    workspaces, 
    onWorkspaceSelect, 
    loading, 
    onUpdate,
    onCreate,
    onDelete  
}) {
    const [selected, setSelected] = useState(null)
    const { isAuthenticated, isLoading: authLoading } = useAuth0()


    const handleWorkspaceSelect = ({workspaceId, ...rest}) => {
        setSelected(workspaceId)
        onWorkspaceSelect({
            workspaceId,
            ...rest
        })
    }

    return (
        <>
            {
                workspaces?.length > 0 && !loading && 
                <>
                    <List>
                        {
                            workspaces.map(w => (
                                <React.Fragment
                                    key={w.workspaceId}
                                >
                                    <WorkspaceListItem 
                                        workspaceId={w.workspaceId}
                                        workspaceName={w.workspaceName}
                                        workspaceColour={w.workspaceColour}
                                        onSelect={(...params) => handleWorkspaceSelect(...params)}
                                        selected={selected === w.workspaceId}
                                        onUpdate={(...params) => onUpdate(...params)}
                                        onDelete={(...params) => onDelete(...params)}
                                    />
                                </React.Fragment>

                            ))
                        }
                    </List>
                    <div className={styles.createButtonContainer}>
                        <CreateWorkspaceButton
                            onCreate={(...params) => onCreate(...params)}
                        >
                            Create another workspace!
                        </CreateWorkspaceButton>
                    </div>
                    
                </>
            }
            {
                workspaces?.length === 0 && !loading && isAuthenticated && (
                    <div className={styles.container}>
                        <PlaceholderImage 
                            className={styles.placeholderImage}
                        />
                        <Typography variant="body2" className={styles.loginText}>
                            Looks like you haven't created any workspaces yet!
                        </Typography>
                        <br />
                        <Typography variant="body2" className={styles.loginText}>
                            Click the button below to get started!
                        </Typography>
                        <br />
                        <CreateWorkspaceButton 
                             onCreate={(...params) => onCreate(...params)}
                        >
                            Create your first workspace!
                        </CreateWorkspaceButton>
                    </div>
                )
            }   
            {
                (isAuthenticated || authLoading) && loading && (
                    <div className={styles.container}>
                        <CircularProgress />
                        <Typography variant="body1">
                            Fetching your workspaces! Hold on!
                            <span role="img" aria-label="rocket ship">🚀</span>
                        </Typography>
                    </div>
                )
            }
            {
                !isAuthenticated && !authLoading && (
                    <div className={styles.container}>
                        <PlaceholderImage 
                            className={styles.placeholderImage}
                        />
                        <Typography variant="body2" className={styles.loginText}>
                            Please login to select a workspace!
                        </Typography>
                        <LoginButton>
                            Login!
                        </LoginButton>
                    </div>
                )
            }
        </>
    )
}