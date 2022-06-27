import React, { useEffect, useState } from 'react'
import { Tabs, IconButton, Button } from '@material-ui/core'
import { AddCircle } from '@material-ui/icons'
import UserViewActionBarTab from './UserViewActionBarTab'
import UserViewDialog from './UserViewDialog'
import VisualisationConfiguration from '../visualisations/VisualisationConfiguration'
import { useLazyApi } from '../../hooks/auth'

import styles from './UserViewActionBar.module.css'

// This component provides functionality needed to implement the user view tab bar
// which allows users to create, edit and delete views.
// It also allows users to switch between different tabs and add measurements based on the selected tab


export default function UserViewActionBar({ 
    workspaceId, 
    workspaceColour, 
    views, 
    currentView,
    onSelect,
    onUpdate,
    onDelete,
    onCreate,
    onVisCreate
}) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [createView, { 
        loading: viewLoading, 
        error: viewError, 
        data: viewData 
    }] = useLazyApi(`/api/workspaces/${workspaceId}/views`, {
        requestOptions: {
            method: 'POST',
            headers : {
                'Content-Type': 'application/json'
            }
        }
    })

    const [addMeasurementDialogOpen, setAddMeasurementDialogOpen] = useState(false)
    const [createVisualisation, { 
        loading: visLoading, 
        error: visError, 
        data: visData 
    }] = useLazyApi(`/api/workspaces/${workspaceId}/views/${currentView?.viewId}/vis`, {
        requestOptions: {
            method: 'POST',
            headers : {
                'Content-Type': 'application/json'
            }
        }
    })

    useEffect(() => {
        if (!viewLoading && viewData) {
            setCreateDialogOpen(false)
            onCreate({
                viewId: viewData.viewId,
                viewName: viewData.viewName
            })
        }
    }, [viewLoading, viewData])

    const handleViewSelect = (event, viewId) => {
        onSelect(views.find(view => view.viewId === viewId))
    }

    const handleCreate = ({ viewName }) => {
        createView({
            body: JSON.stringify({
                viewName
            })
        })
    }

    const handleVisualisationCreate = ({ 
        selectedMeasurement,
        selectedLocation,
        selectedVisualisation
    }) => {
        createVisualisation({
            body: JSON.stringify({
                locationId: selectedLocation.locationId,
                measurementId: selectedMeasurement.measurementId,
                visualisationName: selectedVisualisation.visualisationName
            })
        })
    }

    useEffect(() => {
        if (!visLoading && visData) {
            setAddMeasurementDialogOpen(false)
            onVisCreate(visData)
        }
    }, [visLoading, visData])

    return (
        <div className={styles.container}>
            <div className={styles.tabsContainer}>
                { views && views.length > 0 && 
                    <Tabs
                        value={currentView?.viewId ?? false}
                        onChange={handleViewSelect}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {
                            views.map((view) => (
                                <UserViewActionBarTab
                                    view={view}
                                    workspaceId={workspaceId}
                                    workspaceColour={workspaceColour}
                                    key={view.viewId}
                                    value={view.viewId}
                                    onUpdate={(...params) => onUpdate(...params)}
                                    onDelete={(...params) => onDelete(...params)}
                                />
                            ))
                        }
                    </Tabs>
                }
                <IconButton
                    aria-label="Create new view" 
                    aria-haspopup="true"
                    onClick={() => setCreateDialogOpen(true)}
                >
                    <AddCircle htmlColor={workspaceColour} fontSize="large" />
                </IconButton>
            </div>
            <Button 
                variant="contained" 
                style={{backgroundColor: workspaceColour}}
                className={styles.addMeasurementButton}
                disabled={!currentView}
                onClick={() => setAddMeasurementDialogOpen(true)}
            >
                Add measurement
            </Button>
            <UserViewDialog 
                title="Create your view!"
                text="Please fill out your details below to create a new view!"
                errors={viewError?.errors}
                loading={viewLoading}
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                resetOnCancel={true}
                submitText="Create"
                onSubmit={handleCreate}
                onCancel={() => setCreateDialogOpen(false)}
            />
            <VisualisationConfiguration 
                open={addMeasurementDialogOpen}
                title="Measurement Settings"
                onClose={() => setAddMeasurementDialogOpen(false)}
                onSubmit={handleVisualisationCreate}
            />
            
        </div>
    )
}