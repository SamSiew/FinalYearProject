const app = require('./app')
const prexit = require('prexit')
const { sql } = require('./database')

const port = process.env.PORT

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}!`)
})

// Gracefully close all connections to database on exit
prexit(async () => {
    await sql.end({ timeout: null })
    await new Promise(resolve => server.close(resolve))
})