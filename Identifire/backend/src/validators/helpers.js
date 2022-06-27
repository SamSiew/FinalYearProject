const {validationResult, matchedData } = require('express-validator')

// overrides req fields (body, params, query, cookies, etc.) with validated results
// sets req.validationErrors to validation errors object
const getValidationResult = (options = {}) => (req, res, next) => {
    const { 
        includeOptionals = false, 
        onlyValidData = true, 
        sendError = true,
        locations = ['body', 'params', 'query']
    } = options

    const validationErrors = validationResult(req)
    req.validationErrors = validationErrors

    for (let location of locations) {
        req[location] = matchedData(req, { 
            locations: [location],
            includeOptionals,
            onlyValidData
        })
    }

    if (sendError && !validationErrors.isEmpty()) {
        return res.status(400).send({ errors: validationErrors.array() })
    } else {
        next()
    }
    
}

// Custom middleware to automatically override req fields with validated data and to automatically send an error to the client.
// validation is one of the entries from a validations object exported from a particular validation file
const validate = (validation, options) => {
    return [
        ...validation,
        getValidationResult(options)
    ]
}

module.exports = {
    validate
}