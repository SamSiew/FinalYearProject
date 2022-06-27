import React, { useEffect, useState } from 'react'
import VisualisationFactory from './factory/VisualisationFactory'
import VisualisationConfiguration from './VisualisationConfiguration'
import { Typography, CircularProgress, IconButton } from '@material-ui/core'
import { Edit, Delete } from '@material-ui/icons'
import { Skeleton } from '@material-ui/lab'
import { useApi, useLazyApi } from '../../hooks/auth'

import styles from './Visualisation.module.css'
import VisualisationDeleteConfirmation from './VisualisationDeleteConfirmation'

export default function Visualisation({ visualisation, workspaceId, viewId, onUpdate, onDelete }) {
    const { loading: measurementLoading, data: measurement } = useApi(`/api/measurements/${visualisation.measurementId}`)
    const { loading: locationLoading, data: location } = useApi(`/api/locations/${visualisation.locationId}`)
    const { 
        loading: recordsLoading, 
        data: recordsData,
        refetch: refetchRecords
    } = useApi(`api/workspaces/${workspaceId}/views/${viewId}/vis/${visualisation.userVisId}/fetch`)

    const measurementRecords = recordsData?.records

    useEffect(() => {
        refetchRecords()
    }, [visualisation.visualisationName, visualisation.measurementId, visualisation.locationId])

    const [updateVisDialogOpen, setUpdateVisDialogOpen] = useState(false)
    const [updateVis, { 
        loading: visUpdateLoading, 
        error: visUpdateError, 
        data: visUpdateData 
    }] = useLazyApi(`/api/workspaces/${workspaceId}/views/${viewId}/vis/${visualisation.userVisId}`, {
        requestOptions: {
            method: 'PATCH',
            headers : {
                'Content-Type': 'application/json'
            }
        }
    })

    const handleVisualisationUpdate = ({ selectedMeasurement, selectedLocation, selectedVisualisation }) => {
        updateVis({
            body: JSON.stringify({
                locationId: selectedLocation.locationId,
                measurementId: selectedMeasurement.measurementId,
                visualisationName: selectedVisualisation.visualisationName
            }) 
        })
    }

    useEffect(() => {
        if (!visUpdateLoading && visUpdateData) {
            setUpdateVisDialogOpen(false)
            onUpdate(visUpdateData)
        }
    }, [visUpdateLoading, visUpdateData])

    const [deleteVisDialogOpen, setDeleteVisDialogOpen] = useState(false)
    const [deleteVis, { 
        loading: visDeleteLoading, 
        error: visDeleteError, 
        data: visDeleteData 
    }] = useLazyApi(`/api/workspaces/${workspaceId}/views/${viewId}/vis/${visualisation.userVisId}`, {
        requestOptions: {
            method: 'DELETE',
            headers : {
                'Content-Type': 'application/json'
            }
        }
    })

    const handleVisualisationDelete = () => {
        deleteVis()
    }

    useEffect(() => {
        if (!visDeleteLoading && visDeleteData) {
            setDeleteVisDialogOpen(false)
            onDelete(visDeleteData)
        }
    }, [visDeleteLoading, visDeleteData])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <Typography variant="h6">
                    {!measurement ? <Skeleton /> : measurement.name}
                    </Typography>
                    <Typography variant="button">
                    {!location ? <Skeleton /> : location.name}
                    </Typography>
                </div>
                <div className={styles.headerActionItems}>
                    <IconButton 
                        className={styles.headerActionItem}
                        onClick={() => setUpdateVisDialogOpen(true)}
                    >
                        <Edit />
                    </IconButton>
                    <IconButton 
                        className={styles.headerActionItem}
                        onClick={() => setDeleteVisDialogOpen(true)}
                    >
                        <Delete />
                    </IconButton>
                </div>
            </div>
            <div className={styles.body}>
                {
                    (!measurement || !location || !measurementRecords) &&
                        <div className={styles.measurementsLoading}>
                            <CircularProgress />
                            <Typography variant="h6">
                                Loading your measurements! Hang on! <span>🚀</span>
                            </Typography>
                        </div>
                }
                {
                    measurement && location && measurementRecords && 
                        <VisualisationFactory 
                            visualisation={visualisation}
                            measurement={measurement}
                            records={measurementRecords}
                        />
                }
            </div>
            <VisualisationConfiguration 
                open={updateVisDialogOpen}
                title="Measurement Settings"
                onClose={() => setUpdateVisDialogOpen(false)}
                onSubmit={handleVisualisationUpdate}
                measurement={measurement}
                location={location}
                visualisation={{ visualisationName: visualisation.visualisationName}}
            />
            <VisualisationDeleteConfirmation 
                open={deleteVisDialogOpen}
                onConfirm={handleVisualisationDelete}
                onClose={() => setDeleteVisDialogOpen(false)}
                onCancel={() => setDeleteVisDialogOpen(false)}
            />
        </div>
    )
}