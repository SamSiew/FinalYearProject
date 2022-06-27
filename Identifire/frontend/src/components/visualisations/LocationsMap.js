import React, { useEffect, useState } from 'react'
import { Map, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import { Typography, CircularProgress} from '@material-ui/core'
import cn from 'classnames'

import styles from './LocationsMap.module.css'

const victoriaBounds = [
    [-39.13674005499996,140.96168199600004],
    [-33.98042558699996,149.9762909950001]
]

// Function converts location coords string into array
const parseCoords = (coords) => {
    const convertedCoords = coords.slice(2, -2)    // remove outer brackets
                                  .split('),(')    // get each coord pair by itself
                                  .map(coord => {
                                      return coord
                                                  .split(',')
                                                  .map(c => parseFloat(c))
                                  })
    return convertedCoords
}

export default function LocationsMap({ locations, selectedLocation, onSelectLocation }) {
    const [locationsTransformed, setLocationsTransformed] = useState(null)

    useEffect(() => {
        if (locations) {
            setLocationsTransformed(locations.map(loc => {
                return {
                    ...loc,
                    locationCoords: parseCoords(loc.locationCoords)
                }
            }))
        }
    }, [locations])

    return (
        <>
            {
                locationsTransformed && 
                <Map 
                    bounds={victoriaBounds} 
                    className={styles.mapContainer} 
                    dragging={false} 
                    scrollWheelZoom={"center"}
                    doubleClickZoom={false}
                    boxZoom={false}
                    keyboard={false}
                    zoomControl
                >
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
                    />
                    {
                        locationsTransformed && locationsTransformed.map(location => (
                           <Polygon
                                key={selectedLocation?.locationId === location.locationId
                                    ? location.locationId + ' SELECTED '  // className does not update dynamically, very annoying! So we need to change key to force re-render of polygon
                                    : location.locationId
                                } 
                                positions={location.locationCoords}
                                className={cn(styles.locationPolygon, {
                                    [styles.locationPolygonSelected]: selectedLocation?.locationId === location.locationId 
                                })}
                                onClick={() => onSelectLocation(location)}
                            >
                                <Tooltip>{location.name}</Tooltip>
                            </Polygon>
    ))
                    }
                </Map>
            }
            {
                !locationsTransformed && 
                <div className={styles.mapLoading}>
                    <CircularProgress />
                    <Typography variant="h6">
                        Loading locations! <span>🗺</span>
                    </Typography>
                </div>
            }
        </>
        
    )
}