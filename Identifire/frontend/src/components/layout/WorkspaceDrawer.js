import React, { useEffect, useState } from 'react'
import { Drawer, Typography, IconButton } from '@material-ui/core'
import { ChevronLeft, ChevronRight} from '@material-ui/icons'
import { useApi } from '../../hooks/auth'
import WorkspaceList from '../workspaces/WorkspaceList'
import cn from 'classnames'

// The workspace drawer allows users to select their desired workspace.
// It also allows users to create, edit and delete workspaces.
// Finally, the workspaces drawer is collapsable, allowing more room for visualisations.

import styles from './WorkspaceDrawer.module.css'

export default function WorkspaceDrawer({ onSelect }) {
    const [isOpen, setIsOpen] = useState(true)
    const { loading, data } = useApi('/api/workspaces')
    const [workspaces, setWorkspaces] = useState([]) 

    useEffect(() => {
        if (!loading && data) {
            setWorkspaces(data.workspaces)
        }
    }, [loading, data])

    const handleWorkspaceSelect = (workspace) => {
        onSelect(workspace)
    }

    const handleWorkspaceCreate = (workspace) => {
        setWorkspaces([
            ...workspaces,
            workspace
        ])
    }

    const handleWorkspaceUpdate = ({ workspaceId, ...rest}) => {
        setWorkspaces(workspaces.map(w => {
            if (w.workspaceId === workspaceId) {
                return {
                    ...w,
                    workspaceId,
                    ...rest
                }
            } else {
                return w
            }
        }))
    }

    const handleWorkspaceDelete = ({ workspaceId }) => {
        setWorkspaces(workspaces.filter(w => w.workspaceId !== workspaceId))
    }

    return (
        <div className={cn(styles.drawerContainer, {
            [styles.drawerContainerClosed]: !isOpen
        })}>
            <Drawer
            anchor="left"
            variant="persistent"
            open={isOpen}
            className={styles.drawer}
            classes={{ paper: styles.paper}}
            >
                <div className={styles.drawerHeader}>
                    <Typography variant="h6">
                        WORKSPACES
                    </Typography>
                    <IconButton
                        aria-label="close drawer"
                        className={styles.closeIcon}
                        onClick={() => setIsOpen(false)}
                    >
                        <ChevronLeft />
                    </IconButton>
                </div>
                <div className={styles.drawerBody}>
                    <WorkspaceList 
                        workspaces={workspaces} 
                        onWorkspaceSelect={handleWorkspaceSelect}
                        loading={loading}
                        onCreate={handleWorkspaceCreate}
                        onUpdate={handleWorkspaceUpdate}
                        onDelete={handleWorkspaceDelete}
                    />
                </div>
            </Drawer>
            <div className={cn(styles.openIconContainer, {[styles.hideOpenIconContainer]: isOpen})}>
                <IconButton
                    aria-label="open drawer"
                    className={styles.openIconButton}
                    onClick={() => setIsOpen(true)}
                    >
                        <ChevronRight className={styles.openIcon}/>
                </IconButton>
                <div className={styles.openIconTextContainer}>
                    <Typography variant="h6" className={styles.openIconText}>
                        WORKSPACES
                    </Typography>
                </div>  
            </div>
        </div>
    )
}