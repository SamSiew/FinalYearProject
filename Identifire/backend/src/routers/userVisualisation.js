const Router = require('express-promise-router')
const { validate, validations } = require('../validators/userVisualisation')
const { auth } = require('../auth')
const { sql, toCamelCase, toSnakeCase } = require('../database')

// Module provides all routes for user visualisations

const router = new Router({
    mergeParams: true 
})

// Get a user visualisation
router.get('/:userVisId', auth, validate(validations.getUserVis), async (req, res) => {
    const userVis = req.validationData.userVis
    res.send(userVis)
})

// List all user visualisations
router.get('/', auth, validate(validations.listUserVis), async (req, res) => {
    const userVisualisations = req.validationData.userVisualisations
    res.send({ userVisualisations })
})

// Create a user visualisation
router.post('/', auth, validate(validations.createUserVis), async (req, res) => {
    // Convert visFilter to sql json type
    if (req.body.visFilter) {
        req.body.visFilter = sql.json(req.body.visFilter)
    }
    
    const [newVis] = await sql`
        insert into user_visualisation (
            view_id, 
            location_id, 
            measurement_id, 
            visualisation_name, 
            vis_filter
        ) values (
            ${req.params.viewId},
            ${req.body.locationId},
            ${req.body.measurementId},
            ${req.body.visualisationName},
            ${req.body.visFilter}
        )
        returning *
    `
    res.status(201).send(toCamelCase(newVis))
})

// Update a user visualisation
router.patch('/:userVisId', auth, validate(validations.updateUserVis), async (req, res) => {
    // Convert visFilter to sql json type
    if (req.body.visFilter) {
        req.body.visFilter = sql.json(req.body.visFilter)
    }

    // convert column names into format suitable for database
    const dbUpdates = toSnakeCase(req.body)

    const [userVis] = await sql`
        update user_visualisation
        set ${sql(dbUpdates, ...Object.keys(dbUpdates))}
        where user_vis_id = ${req.params.userVisId}
        returning *
    `
    res.status(200).send(toCamelCase(userVis))
})

// Delete a user visualisation
router.delete('/:userVisId', auth, validate(validations.deleteUserVis), async (req, res) => {
    const [deletedUserVis] = await sql`
        delete from user_visualisation
        where user_vis_id = ${req.params.userVisId}
        returning *
    `
    res.send(toCamelCase(deletedUserVis))
})

router.get('/:userVisId/fetch', auth, validate(validations.fetchUserVisData), async (req, res) => {
    const userVis = req.validationData.userVis

    const [measurement] = await sql`
        select
            m.name,
            m.description,
            m.measurement_type as "measurementType"
        from measurement m
        where measurement_id = ${userVis.measurementId}
    `
    let records = await sql`
        select
            mr.*,
            mr_subtype.*
        from measurement_record mr
            join record_location rl
                on mr.measurement_record_id = rl.measurement_record_id
                    and rl.location_id = ${userVis.locationId}
            join ${sql(`${measurement.measurementType}_record`)} mr_subtype
                on mr_subtype.measurement_record_id = mr.measurement_record_id
        where mr.measurement_id = ${userVis.measurementId}
        order by mr.start_timestamp asc
    `
    records = records.map(record => toCamelCase(record))

    res.send({ records })
})

module.exports = router