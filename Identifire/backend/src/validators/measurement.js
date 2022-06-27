const { param } = require('express-validator')
const { validate } = require('./helpers')
const { checkLocationType } = require('./location')
const { sql, toCamelCase } = require('../database')

// Module contains all validation and sanitisation logic for measurement routes

const checkMeasurementParam = param('measurementId').escape()
    .isNumeric({no_symbols: true}).withMessage('measurementId must be an integer')

const checkValidMeasurementRequest = [
    checkMeasurementParam
    .bail()
    .custom(async (measurementId, { req }) => {
        const [measurement] = await sql`
            select *
            from measurement
            where measurement_id = ${measurementId}
        `
        if (!measurement) {
            throw new Error('Measurement does not exist')
        }

        if (!req.validationData) {
            req.validationData = {}
        }
        req.validationData.measurement = toCamelCase(measurement)
    })
]

const getMeasurement = [
    ...checkValidMeasurementRequest
]

const listVisualisations = [
    ...checkValidMeasurementRequest
]

const listLocations = [
    ...checkValidMeasurementRequest,
    checkLocationType
]

const validations = {
   getMeasurement,
   listVisualisations,
   listLocations
}

module.exports = {
    validations,
    validate
}