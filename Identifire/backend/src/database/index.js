const postgres = require('postgres')
const { toCamelCase, toSnakeCase } = require('./transform')
const { escape } = require('./sanitise')

// File exports necessary cdoe for database access and transformation

const sql = postgres({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD
})

module.exports = {
    sql,
    toCamelCase,
    toSnakeCase,
    escape
}