import React, { useEffect, useState } from 'react'
import { 
    Button,
    Dialog,
    TextField,
    Typography,
    IconButton,
    Slide,
    Divider
} from '@material-ui/core'
import { Close, Save } from '@material-ui/icons'
import { Autocomplete } from '@material-ui/lab'
import LocationsMap from './LocationsMap'
import { useApi, useLazyApi } from '../../hooks/auth'

import styles from './VisualisationConfiguration.module.css'


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

export default function VisualisationConfiguration({
    open,
    onClose,
    title,
    onSubmit,
    measurement: measurementProps = null,
    visualisation: visualisationProps = null,
    location: locationProps = null
}) {
    const { loading: measurementLoading, data: measurementData } = useApi('/api/measurements')
    const [selectedMeasurement, setSelectedMeasurement] = useState(null)
    
    const [selectedVisualisation, setSelectedVisualisation] = useState(null)
    const [getVisualisations, {
        loading: visualisationsLoading,
        data: visualisationsData
    }] = useLazyApi(`/api/measurements/${selectedMeasurement?.measurementId}/vis`)

    const [selectedLocation, setSelectedLocation] = useState(null)
    const [getLocations, {
        loading: locationsLoading,
        data: locationsData
    }] = useLazyApi(`/api/measurements/${selectedMeasurement?.measurementId}/locations?type=lga`)

    const measurements = measurementData?.measurements ?? []
    const visualisations = visualisationsData?.visualisations ?? []
    const locations = locationsData?.locations ?? []

    const handleMeasurementChange = (event, measurement, reason) => {
        if (reason === 'select-option') {
            setSelectedMeasurement(measurement)
        } else if (reason === 'clear') {
            setSelectedMeasurement(null)
        }
    }

    const handleVisualisationChange = (event, vis, reason) => {
        if (reason === 'select-option') {
            setSelectedVisualisation(vis)
        } else if (reason === 'clear') {
            setSelectedVisualisation(null)
        }
    }

    const handleLocationChange = (event, location, reason) => {
        if (reason === 'select-option') {
            setSelectedLocation(location)
        } else if (reason === 'clear') {
            setSelectedLocation(null)
        }
    }

    useEffect(() => {
        if (selectedMeasurement) {
            getVisualisations()
            getLocations()
        }
    }, [selectedMeasurement])

    const handleClose = () => {
        setSelectedMeasurement(measurementProps)
        setSelectedVisualisation(visualisationProps)
        setSelectedLocation(locationProps)
        onClose()
    }

    useEffect(function resetAfterSubmit() {
        if (!open) {
            setSelectedMeasurement(measurementProps)
            setSelectedVisualisation(visualisationProps)
            setSelectedLocation(locationProps)
        }
    }, [open])

    const handleSubmit = () => {
        if (selectedMeasurement && selectedVisualisation && selectedLocation) {
            onSubmit({
                selectedMeasurement,
                selectedVisualisation,
                selectedLocation
            })
        }
    }

    useEffect(function populateInitialValues(){
        if (measurementProps) {
            setSelectedMeasurement(measurementProps)
        }
        if (visualisationProps) {
            setSelectedVisualisation(visualisationProps)
        }
        if (locationProps) {
            setSelectedLocation(locationProps)
        }
    }, [measurementProps, visualisationProps, locationProps])

    return (
        <Dialog 
            open={open} 
            fullScreen
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <div className={styles.header}>
                <div className={styles.titleContainer}>
                    <IconButton
                        onClick={handleClose}
                        className={styles.closeButton}
                    >
                        <Close />
                    </IconButton>
                    <Typography variant="h6" className={styles.title}>
                        {title}
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Save />}
                    className={styles.saveButton}
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            </div>
            <div className={styles.body}>

                <div className={styles.measurementContainer}>
                    <Typography variant="subtitle1">
                        Please select a measurement!
                    </Typography>
                    <Autocomplete 
                        options={measurements}
                        className={styles.measurementSelect}
                        getOptionLabel={(measurement) => measurement.name}
                        groupBy={(measurement) => measurement.measurementType}
                        renderInput={(params) => (
                            <TextField {...params} variant="outlined" label="measurements"/>
                        )}
                        onChange={handleMeasurementChange}
                        value={selectedMeasurement}
                        getOptionSelected={(option, value) => option?.measurementId === value?.measurementId}
                    />
                </div>
                <Divider className={styles.divider} />
                {
                    selectedMeasurement && <>
                        <div className={styles.measurementContainer}>
                            <Typography variant="subtitle1">
                                Please select a visualisation!
                            </Typography>
                            <Autocomplete 
                                options={visualisations}
                                className={styles.measurementSelect}
                                getOptionLabel={(vis) => vis.visualisationName}
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" label="visualisations"/>
                                )}
                                onChange={handleVisualisationChange}
                                value={selectedVisualisation}
                                getOptionSelected={(option, value) => option?.visualisationName === value?.visualisationName}
                            />
                        </div>
                        <Divider className={styles.divider} />
                        <div className={styles.measurementContainer}>
                            <Typography variant="subtitle1">
                                Please select a location. You can use either the drop down list or the interactive map below!
                            </Typography>
                            <Autocomplete 
                                options={locations}
                                className={styles.measurementSelect}
                                getOptionLabel={(location) => {
                                    return location.name}}
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" label="locations"/>
                                )}
                                onChange={handleLocationChange}
                                value={selectedLocation}
                                getOptionSelected={(option, value) => option?.locationId === value?.locationId}
                            />
                        </div>
                        <div className={styles.mapContainer}>
                            <LocationsMap 
                                locations={locations}
                                selectedLocation={selectedLocation}
                                onSelectLocation={(loc) => setSelectedLocation(loc)}
                            />
                        </div>
                        
                    </>
                }
                {
                    !selectedMeasurement && (
                        <div>
                            <Typography varaint="h6">
                                Please select a measurement <span>😄</span>
                            </Typography>
                        </div>
                    )
                }
            </div>

        </Dialog>
    )
}