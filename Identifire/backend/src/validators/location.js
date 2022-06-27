const { query, param } = require('express-validator')
const { validate } = require('./helpers')
const { sql, toCamelCase } = require('../database')

// Module contains all validation and sanitisation logic for location routes

// Keys are valid query params while values are
// corresponding database table names
const locationTypes = {
    lga: 'local_government_area',
    state: 'state',
    country: 'country',
    weather: 'weather_station'
}

const checkLocationParam = param('locationId').escape()
    .isNumeric({no_symbols: true}).withMessage('locationId must be an integer')

const checkLocationType = query('type')
        .trim().escape()
        .exists().isString().notEmpty().withMessage('Location type must be specified')
        .isIn(Object.keys(locationTypes)).withMessage(`Location type must be one of: [${Object.keys(locationTypes)}]`)
        .customSanitizer(locationType => locationTypes[locationType])

const checkValidLocationRequest = [
    checkLocationParam
    .bail()
    .custom(async (locationId, {req}) => {
        const [location] = await sql`
            select *
            from location
            where location_id = ${locationId}
        `
        if (!location) {
            throw new Error(`Location with id '${locationId}' does not exist`)
        }

        if (!req.validationData) {
            req.validationData = {}
        }
        req.validationData.location = toCamelCase(location)
    })
]

const getLocation = [
    checkValidLocationRequest
]

const listLocations = [
    checkLocationType
]


const validations = {
    getLocation,
    listLocations
}

module.exports = {
    validations,
    validate,
    checkLocationType
}