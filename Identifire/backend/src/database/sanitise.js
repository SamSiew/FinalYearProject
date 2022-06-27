const format = require('pg-format')

// File provides code to escape SQL identifiers (only needed for manually concatanating strings)

// Escapes postgreSQL identifiers
// Adds a simple wrapper around pg-format
const escape = (identifier) => {
    return format.ident(identifier)
}

module.exports = {
    escape
}