import React from 'react'
import LineChart from './LineChart'

//TODO: DELETE THIS FILE

export default function generateVisualisation(visualisation, measurement, records) {
    if (visualisation.visualisationName.toLowerCase() === 'line graph') {
        if (measurement.name.toLowerCase() === 'temperature') {
            return <LineChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0].units}
                        lines={[{
                            key: 'minValue',
                            strokeColour: '#fcba03'
                        }, {
                            key: 'maxValue',
                            strokeColour: '#fc6203'
                        }]} 
                    />
        } else if (measurement.name.toLowerCase() === 'rainfall') {
            return <LineChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0].units}
                        lines={[{
                            key: 'accumulatedValue',
                            strokeColour: '#fc6203'
                        }]}
                    />
        }
    }
}