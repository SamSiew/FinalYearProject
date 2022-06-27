const express = require('express');
const path = require('path');
const { 
    workspaceRouter, 
    userViewRouter, 
    userVisRouter,
    locationRouter,
    measurementRouter
} = require('./routers')

const buildPath = path.join(__dirname, '../../frontend/build')

const app = express()

app.use(express.json())

// Serve static files
app.use(express.static(buildPath))

app.use('/api/workspaces', workspaceRouter)
app.use('/api/workspaces/:workspaceId/views', userViewRouter)
app.use('/api/workspaces/:workspaceId/views/:viewId/vis', userVisRouter)
app.use('/api/locations', locationRouter)
app.use('/api/measurements', measurementRouter)

// Return index.html for any unknown paths
app.get('/*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'))
})

module.exports = app
