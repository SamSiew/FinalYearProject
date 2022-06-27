import React, { useState, useEffect } from 'react'
import { 
    ListItem, 
    ListItemAvatar,
    ListItemText, 
    ListItemSecondaryAction, 
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon
} from '@material-ui/core'
import { Folder, MoreVert, Edit, Delete } from '@material-ui/icons'
import WorkspaceDialog from './WorkspaceDialog'
import WorkspaceDeleteConfirmation from './WorkspaceDeleteConfirmation'
import { useLazyApi } from '../../hooks/auth'

import styles from './WorkspaceListItem.module.css'

// This component represents an individual workspace list item which allows users to edit and delete workspaces

export default function WorkspaceListItem({
    workspaceId,
    workspaceColour,
    workspaceName,
    onSelect,
    selected,
    onDelete,
    onUpdate
}) {
    const [optionsAnchorEl, setOptionsAnchorEl] = useState(null)
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [updateWorkspace, { 
        loading: updateLoading, 
        error: updateError, 
        data: updateData 
    }] = useLazyApi(`/api/workspaces/${workspaceId}`, {
        requestOptions: {
            method: 'PATCH',
            headers : {
                'Content-Type': 'application/json'
            }
        }
    })
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteWorkspace, { 
        loading: deleteLoading, 
        error: deleteError, 
        data: deleteData 
    }] = useLazyApi(`/api/workspaces/${workspaceId}`, {
        requestOptions: {
            method: 'DELETE',
            headers : {
                'Content-Type': 'application/json'
            }
        }
    })

    useEffect(() => {
        if (!updateLoading && updateData) {
            setUpdateDialogOpen(false)
            onUpdate({
                workspaceId,
                workspaceName: updateData.workspaceName,
                workspaceColour: updateData.workspaceColour
            })
        }
    }, [updateLoading, updateData])

    useEffect(() => {
        if (!deleteLoading && deleteData) {
            setDeleteDialogOpen(false)
            onDelete({ workspaceId })
        }
    }, [deleteLoading, deleteData])

    const handleWorkspaceOptionsSelect = (event) => {
        setOptionsAnchorEl(event.currentTarget) 
    }

    const handleWorkspaceOptionsClose = () => {
        setOptionsAnchorEl(null)
    }

    const handleUpdate = ({ workspaceName, workspaceColour }) => {
        updateWorkspace({
            body: JSON.stringify({
                workspaceName,
                workspaceColour
            })
        })
    }

    const handleDelete = () => {
        deleteWorkspace()
    }

    const handleEditWorkspace = () => {
        setUpdateDialogOpen(true)
        handleWorkspaceOptionsClose()
    }

    const handleDeleteWorkspace = () => {
        setDeleteDialogOpen(true)
        handleWorkspaceOptionsClose()
    }

    const handleItemSelect = () => {
        onSelect({
            workspaceId,
            workspaceName,
            workspaceColour
        })
    }

    return (
        <>
            <ListItem 
                button 
                onClick={() => handleItemSelect()}
                key={workspaceId}
                selected={selected}
            >
                <ListItemAvatar>
                    <Avatar className={styles.listAvatar}>
                        <Folder htmlColor={workspaceColour}/>
                    </Avatar>
                </ListItemAvatar>
                <ListItemText 
                    primary={workspaceName}
                />
                <ListItemSecondaryAction>
                    <IconButton
                        aria-label="Open workspace options" 
                        aria-haspopup="true"
                        onClick={handleWorkspaceOptionsSelect}
                    >
                        <MoreVert />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
            <Menu
                anchorEl={optionsAnchorEl}
                keepMounted
                open={optionsAnchorEl !== null}
                onClose={handleWorkspaceOptionsClose}
            >
                <MenuItem 
                    button
                    onClick={handleEditWorkspace}
                >
                    <ListItemIcon>
                        <Edit />
                    </ListItemIcon>
                    <ListItemText primary="Edit workspace" />
                </MenuItem>
                <MenuItem
                    button 
                    className={styles.deleteOption}
                    onClick={handleDeleteWorkspace}
                >
                    <ListItemIcon className={styles.deleteOption}>
                        <Delete />
                    </ListItemIcon>
                    <ListItemText primary="Delete workspace" />
                </MenuItem>
            </Menu>
            <WorkspaceDialog 
                title="Update your workspace!"
                text="Please fill out the details below to update your workspace!"
                errors={updateError?.errors}
                loading={updateLoading}
                open={updateDialogOpen}
                onClose={() => setUpdateDialogOpen(false)}
                resetOnCancel={true}
                workspaceName={workspaceName}
                workspaceColour={workspaceColour}
                submitText="Update"
                onSubmit={handleUpdate}
                onCancel={() => setUpdateDialogOpen(false)}
            />
            <WorkspaceDeleteConfirmation 
                open={deleteDialogOpen}
                onConfirm={() => handleDelete()}
                onClose={() => setDeleteDialogOpen(false)}
                onCancel={() => setDeleteDialogOpen(false)}
            />
        </>
    )
}