const Router = require('express-promise-router')
const { validate, validations } = require('../validators/measurement')
const { auth } = require('../auth')
const { sql, toCamelCase, toSnakeCase } = require('../database')

// Module provides routes for measurements

const router = new Router()

// Get a measurement
router.get('/:measurementId', auth, validate(validations.getMeasurement), async (req, res) => {
    const [measurement] = await sql`
        select *
        from measurement
        where measurement_id = ${req.params.measurementId}
    `
    res.send(toCamelCase(measurement))
})

// list all measurements
router.get('/', auth, async (req, res) => {
    let measurements = await sql`
        select *
        from measurement
        order by measurement_id
    `
    measurements = measurements.map(m => toCamelCase(m))
    res.send({ measurements })
})

// Get all visualisations for a given measurement
router.get('/:measurementId/vis', auth, validate(validations.listVisualisations), async (req, res) => {
    let visualisations = await sql`
        select *
        from measurement_visualisation
            join visualisation using (visualisation_name)
        where measurement_id = ${req.params.measurementId}
    `
    visualisations = visualisations.map(v => toCamelCase(v))
    res.send({ visualisations })
})

// Get all available locations for a given measurement
// ?type=<location_type>
router.get('/:measurementId/locations', auth, validate(validations.listLocations), async (req, res) => {
    let locations = await sql`
        select
            l.*,
            loc_subtype.*
        from measurement_location ml
            join location l using (location_id)
            join ${sql(req.query.type)} loc_subtype using (location_id)
        where measurement_id = ${req.params.measurementId}
    `
    locations = locations.map(l => toCamelCase(l))
    res.send({ locations })
})

module.exports = router