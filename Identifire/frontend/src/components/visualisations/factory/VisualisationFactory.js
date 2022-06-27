import React, { useEffect, useState } from 'react'
import { LineChart, BarChart, ScatterChart } from './charts'
 
const visualisations = {
    'line graph': {
        temperature: (visualisation, measurement, records) => {
            return <LineChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0]?.units}
                        lines={[{
                            key: `Minimum ${measurement.name}`,
                            strokeColour: '#fcba03'
                        }, {
                            key: `Maximum ${measurement.name}`,
                            strokeColour: '#fc6203'
                        }]} 
                    />
        },
        rainfall: (visualisation, measurement, records) => {
            return <LineChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0]?.units}
                        lines={[{
                            key: `${measurement.name}`,
                            strokeColour: '#fc6203'
                        }]} 
                    />
        },
        'relative humidity': (visualisation, measurement, records) => {
            return <LineChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0]?.units}
                        lines={[{
                            key: `Minimum ${measurement.name}`,
                            strokeColour: '#fcba03'
                        }, {
                            key: `Maximum ${measurement.name}`,
                            strokeColour: '#fc6203'
                        }]} 
                    />
        },
        'wind speed': (visualisation, measurement, records) => {
            return <LineChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0]?.units}
                        lines={[{
                            key: `Average ${measurement.name}`,
                            strokeColour: '#fc6203'
                        }]} 
                    />
        }
    },
    'bar graph': {
        temperature: (visualisation, measurement, records) => {
            return <BarChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0]?.units}
                        bars={[{
                            key: `Minimum ${measurement.name}`,
                            fillColour: '#fcba03'
                        }, {
                            key: `Maximum ${measurement.name}`,
                            fillColour: '#fc6203'
                        }]}
                    />
        },
        rainfall: (visualisation, measurement, records) => {
            return <BarChart 
                records={records} 
                xAxisKey="date"
                units={records[0]?.units}
                bars={[{
                    key: `${measurement.name}`,
                    fillColour: '#fc6203'
                }]}
            />
        },
        'relative humidity': (visualisation, measurement, records) => {
            return <BarChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0]?.units}
                        bars={[{
                            key: `Minimum ${measurement.name}`,
                            fillColour: '#fcba03'
                        }, {
                            key: `Maximum ${measurement.name}`,
                            fillColour: '#fc6203'
                        }]}
                    />
        },
        'wind speed': (visualisation, measurement, records) => {
            return <BarChart 
                records={records} 
                xAxisKey="date"
                units={records[0]?.units}
                bars={[{
                    key: `Average ${measurement.name}`,
                    fillColour: '#fc6203'
                }]}
            />
        }
    },
    'scatter graph': {
        temperature: (visualisation, measurement, records) => {
            return <ScatterChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0]?.units}
                        scatters={[{
                            key: `Minimum ${measurement.name}`,
                            fillColour: '#fcba03'
                        }, {
                            key: `Maximum ${measurement.name}`,
                            fillColour: '#fc6203'
                        }]}
                    />
        },
        rainfall: (visualisation, measurement, records) => {
            return <ScatterChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0]?.units}
                        scatters={[{
                            key: `${measurement.name}`,
                            fillColour: '#fc6203'
                        }]}
                    />
        },
        'relative humidity': (visualisation, measurement, records) => {
            return <ScatterChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0]?.units}
                        scatters={[{
                            key: `Minimum ${measurement.name}`,
                            fillColour: '#fcba03'
                        }, {
                            key: `Maximum ${measurement.name}`,
                            fillColour: '#fc6203'
                        }]}
                    />
        },
        'wind speed': (visualisation, measurement, records) => {
            return <ScatterChart 
                        records={records} 
                        xAxisKey="date"
                        units={records[0]?.units}
                        scatters={[{
                            key: `Average ${measurement.name}`,
                            fillColour: '#fc6203'
                        }]}
                    />
        }
    }
}

export default function VisualisationFactory({ visualisation, measurement, records }) {
    const [measurementRecords, setMeasurementRecords] = useState(null)

    // Transform weather record structure to have nicer display properties
    useEffect(() => {
        if (measurement.measurementType === 'weather' && records) {
            const measurements = records.map(r => {
                // convert endTimestamp to just date for displaying
                const endTimestamp = new Date(r.endTimestamp)
                r.date = `${endTimestamp.getDate()}/${endTimestamp.getMonth() + 1}/${endTimestamp.getFullYear()}`

                // convert value names
                r[`Maximum ${measurement.name}`] = r.maxValue
                delete r.maxValue

                r[`Minimum ${measurement.name}`] = r.minValue
                delete r.minValue

                r[`Average ${measurement.name}`] = r.avgValue
                delete r.avgValue

                r[`${measurement.name}`] = r.accumulatedValue
                delete r.accumulatedValue
                return r
            })
            setMeasurementRecords(measurements)
        }
    }, [records, measurement])

    const generateVisualisation = visualisations[visualisation.visualisationName.toLowerCase()][measurement.name.toLowerCase()]

    return (
        <>
            {
                measurementRecords && (
                    generateVisualisation(visualisation, measurement, records)
                )
            }
        </>
    )

}