import React from 'react'
import Visualisation from './Visualisation'

import styles from './VisualisationGrid.module.css'

export default function VisualisationGrid({ visualisations, workspaceId, viewId, onVisUpdate, onVisDelete }) {

    visualisations = visualisations ?? []

    return (
        <div>
            {
                visualisations.map(vis => (
                    <div key={vis.userVisId} className={styles.visualisationContainer}>
                        <Visualisation 
                            visualisation={vis}
                            workspaceId={workspaceId}
                            viewId={viewId}
                            onUpdate={onVisUpdate}
                            onDelete={onVisDelete}
                        />
                    </div>
                ))
            }
        </div>
    )
}