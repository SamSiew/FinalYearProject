import React, { useEffect, useState } from 'react'
import { Typography } from '@material-ui/core'
import UserViewActionBar from '../userViews/UserViewActionBar';
import TabPanel from '../userViews/TabPanel'
import VisualisationGrid from '../visualisations/VisualisationGrid';
import { ReactComponent as ViewPanelPlaceholder } from './assets/viewPanelPlaceholder.svg';
import { useAuth0 } from '@auth0/auth0-react';
import { useLazyApi } from '../../hooks/auth'

// Component represented the view panel which allows users to add views and visualisations to the panel.
// It allows users to add different view tabs and visualisations within those tabs.
// The view panel is dynamically styled according the styling preferences of the workspace.

import styles from './ViewPanel.module.css'


export default function ViewPanel({ workspaceId, workspaceName, workspaceColour }) {
    const { isAuthenticated } = useAuth0()
    const [currentView, setCurrentView] = useState(null)
    const [getViews, { loading: viewLoading, error: viewError, data: viewData}] = useLazyApi(`/api/workspaces/${workspaceId}/views`)
    const [views, setViews] = useState([])

    const [visualisations, setVisualisations] = useState({})
    const [getVisualisations, { 
        loading: visLoading, 
        error: visError, 
        data: visData
    }] = useLazyApi(`/api/workspaces/${workspaceId}/views/${currentView?.viewId}/vis`)

    useEffect(() => {
        if (workspaceId) {
            setViews([])
            setCurrentView(null)
            getViews()
        }
    }, [workspaceId])

    useEffect(() => {
        if (!viewLoading && viewData) {
            setViews(viewData.userViews)
        }
    }, [viewLoading, viewData])

    useEffect(() => {
        if (currentView && !visualisations[currentView.viewId]) {
            getVisualisations()
        }
    }, [currentView, visualisations])

    useEffect(() => {
        if (!visLoading && visData) {
            setVisualisations({
                ...visualisations,
                [currentView.viewId]: visData.userVisualisations
            })
        }
    }, [visData, visLoading])

    const handleViewCreate = (view) => {
        const newViews = [
            ...views,
            view
        ]
        setViews(newViews)
        setCurrentView(view)
    }

    const handleViewUpdate = ({ viewId, viewName }) => {
        const newViews = views.map(v => {
            if (v.viewId === viewId) {
                return {
                    ...v,
                    viewName
                }
            } else {
                return v
            }
        })
        setViews(newViews)
    }

    const handleViewDelete = ({ viewId }) => {
        const newViews = views.filter(v => v.viewId !== viewId)
        setViews(newViews)
        
        if (currentView.viewId === viewId) {
            setCurrentView(null)
        }
    }

    const handleVisualisationCreate = (vis) => {
        setVisualisations({
            ...visualisations,
            [vis.viewId]: [
                ...visualisations[vis.viewId],
                vis
            ]
        })
    }

    const handleVisualisationUpdate = (vis) => {
        setVisualisations({
            ...visualisations,
            [vis.viewId]: visualisations[vis.viewId].map(v => v.userVisId === vis.userVisId ? vis : v)
        })
    }

    const handleVisualisationDelete = (vis) => {
        setVisualisations({
            ...visualisations,
            [vis.viewId]: visualisations[vis.viewId].filter(v => v.userVisId !== vis.userVisId)
        })
    }

    return (
        <div className={styles.viewPanelContainer}>
            {
                ((!workspaceId && isAuthenticated) || (!isAuthenticated)) && (
                    <>
                        <div className={styles.viewPanelHeader}>
                            <Typography variant="h6">
                                {
                                    isAuthenticated
                                    ? "SELECT A WORKSPACE TO GET STARTED!"
                                    : "LOGIN TO GET STARTED!"
                                } 
                            </Typography>
                        </div>
                        <div className={styles.viewPanelBody}>
                            <ViewPanelPlaceholder className={styles.viewPanelPlaceholder} />
                            <Typography variant="h6">
                                {
                                    isAuthenticated
                                    ? "Select a workspace to get started!"
                                    : "Login to get started!"
                                } 
                            </Typography>
                        </div>
                    </>
                )
            }
            {
                workspaceId && (
                    <>
                        <div className={styles.viewPanelHeader} style={{backgroundColor: workspaceColour}}>
                            <Typography variant="h6">
                                {workspaceName}
                            </Typography>
                        </div>
                        <div className={styles.actionBar}>
                            <UserViewActionBar 
                                workspaceId={workspaceId}
                                workspaceColour={workspaceColour}
                                onSelect={(view) => setCurrentView(view)}
                                views={views}
                                currentView={currentView}
                                onUpdate={handleViewUpdate}
                                onDelete={handleViewDelete}
                                onCreate={handleViewCreate}
                                onVisCreate={handleVisualisationCreate}
                            />
                        </div>
                        <div className={styles.viewPanelBody}>
                           {
                               views.map(view => (
                                    <TabPanel
                                        key={view.viewId}
                                        value={currentView?.viewId}
                                        identifier={view.viewId}
                                    >
                                        <VisualisationGrid 
                                            visualisations={visualisations?.[view.viewId]}
                                            workspaceId={workspaceId}
                                            viewId={view.viewId}
                                            onVisUpdate={handleVisualisationUpdate}
                                            onVisDelete={handleVisualisationDelete}
                                        />
                                   </TabPanel>
                               ))
                           }
                           {
                               !currentView && views.length > 0 && (
                                   <Typography variant="h6">
                                       Select a view to get started!
                                   </Typography>
                               )
                           }
                           {
                               !currentView && views.length === 0 && (
                                   <Typography variant="h6">
                                       Create a view above to get started!
                                   </Typography>
                               )
                           }
                        </div>
                    </>
                )
            }            
        </div>
    )
}