const Router = require('express-promise-router')
const { validate, validations } = require('../validators/location')
const { auth } = require('../auth')
const { sql, toCamelCase, toSnakeCase } = require('../database')

// Module provides all routes for locations

const router = new Router()

// get a location 
router.get('/:locationId', auth, validate(validations.getLocation), async (req, res) => {
    const location = req.validationData.location
    const [locWithSub] = await sql`
        select *
        from location loc
            join ${sql(location.locationType)} loc_subtype
                using (location_id)
        where location_id = ${req.params.locationId}
    `
    locationWithSubtype = toCamelCase(locWithSub)
    
    res.send(locationWithSubtype)
})

// list all locations
// accepts query ?type=<location_type>
router.get('/', auth, validate(validations.listLocations), async (req, res) => {
    let locations = await sql`
        select
            *
        from location loc
            join ${sql(req.query.type)} loc_subtype
                using (location_id)
    `
    locations = locations.map(location => toCamelCase(location))
    res.send({ locations })
})

module.exports = router