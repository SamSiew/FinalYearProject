const { snakeCase, camelCase } = require('change-case')

// File provides transformation functions to convert between different cases
// Database requires snake case
// JavaScript code requires camel case

const toCamelCase = (obj) => {
    const camelCaseObj = {}
    Object.keys(obj).forEach(name => {
        camelCaseObj[camelCase(name)] = obj[name]
    })
    return camelCaseObj
}

const toSnakeCase = (obj) => {
    const snakeCaseObj = {}
    Object.keys(obj).forEach(name => {
        snakeCaseObj[snakeCase(name)] = obj[name]
    })
    return snakeCaseObj
}

module.exports = {
    toCamelCase,
    toSnakeCase
}