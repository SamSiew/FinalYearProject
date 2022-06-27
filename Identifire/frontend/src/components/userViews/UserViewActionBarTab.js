import React, { useState, useEffect } from 'react'
import { Tab, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'
import { MoreVert, Delete, Edit } from '@material-ui/icons'
import UserViewDialog from './UserViewDialog'
import UserViewDeleteConfirmation from './UserViewDeleteConfirmation'
import { useLazyApi } from '../../hooks/auth'

import styles from './UserViewActionBarTab.module.css'

// This component represents a tab within the view tab bar.
// Each tab allows users to edit and delete the current tab.

export default function UserViewActionBarTab({ 
    view, 
    workspaceId, 
    workspaceColour, 
    onUpdate,
    onDelete,
    ...other 
}) {
    const [optionsAnchorEl, setOptionsAnchorEl] = useState(null)
    
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [updateView, {
        loading: updateLoading,
        error: updateError,
        data: updateData
    }] = useLazyApi(`/api/workspaces/${workspaceId}/views/${view.viewId}`, {
        requestOptions: {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    })
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteView, { 
        loading: deleteLoading, 
        error: deleteError, 
        data: deleteData 
    }] = useLazyApi(`/api/workspaces/${workspaceId}/views/${view.viewId}`, {
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
                viewId: view.viewId,
                viewName: updateData.viewName
            })
        }
    }, [updateLoading, updateData])

    useEffect(() => {
        if (!deleteLoading && deleteData) {
            setDeleteDialogOpen(false)
            onDelete({ viewId: view.viewId })
        }
    }, [deleteLoading, deleteData])


    const handleUpdate = ({ viewName }) => {
        updateView({
            body: JSON.stringify({ viewName })
        })
    }

    const handleDelete = () => {
        deleteView()
    }

    const handleTabOptionsSelect= (event) => {
        setOptionsAnchorEl(event.currentTarget) 
    }

    const handleTabOptionsClose = () => {
        setOptionsAnchorEl(null)
    }

    const handleEditView = () => {
        setUpdateDialogOpen(true)
        handleTabOptionsClose()
    }

    const handleDeleteView = () => {
        setDeleteDialogOpen(true)
        handleTabOptionsClose()
    }

    return (
        <>
            <Tab 
                label={<span className={styles.viewName}>{view.viewName}</span>}
                className={styles.tab}
                classes={{ wrapper: styles.wrapper }}
                style={{backgroundColor: workspaceColour}}
                icon={(
                    <IconButton
                        aria-label="Open view options" 
                        aria-haspopup="true"
                        className={styles.optionsButton}
                        onClick={handleTabOptionsSelect}
                    >
                        <MoreVert />
                    </IconButton>
                )}
                {...other}
            />
            <Menu
                anchorEl={optionsAnchorEl}
                keepMounted
                open={optionsAnchorEl !== null}
                onClose={handleTabOptionsClose}
            >
                <MenuItem 
                    button
                    onClick={handleEditView}
                >
                    <ListItemIcon>
                        <Edit />
                    </ListItemIcon>
                    <ListItemText primary="Edit view" />
                </MenuItem>
                <MenuItem
                    button 
                    className={styles.deleteOption}
                    onClick={handleDeleteView}
                >
                    <ListItemIcon className={styles.deleteOption}>
                        <Delete />
                    </ListItemIcon>
                    <ListItemText primary="Delete view" />
                </MenuItem>
            </Menu>
            <UserViewDialog 
                title="Update your view!"
                text="Please fill out the details below to update your view!"
                errors={updateError?.errors}
                loading={updateLoading}
                open={updateDialogOpen}
                onClose={() => setUpdateDialogOpen(false)}
                resetOnCancel={true}
                viewName={view.viewName}
                submitText="Update"
                onSubmit={handleUpdate}
                onCancel={() => setUpdateDialogOpen(false)}
            />
            <UserViewDeleteConfirmation 
                open={deleteDialogOpen}
                onConfirm={() => handleDelete()}
                onClose={() => setDeleteDialogOpen(false)}
                onCancel={() => setDeleteDialogOpen(false)}
            />
        </>
    )
}