const Router = require('express-promise-router')
const { validations, validate } = require('../validators/workspace')
const { auth } = require('../auth')
const { sql } = require('../database')
const { toCamelCase, toSnakeCase} = require('../database/transform')

// Module provides all routes for workspaces

const router = new Router()

// Get a workspace
router.get('/:workspaceId', auth, validate(validations.getWorkspace), async (req, res) => {
    const workspace = req.validationData.workspace

    res.status(200).send(workspace)
})

// List all workspaces
router.get('/', auth, async (req, res) => {
    let workspaces = await sql`
        select * 
        from workspace
        where owner_email = ${req.user.email}
        order by workspace_id
    `
    workspaces = workspaces.map(workspace => toCamelCase(workspace))
    if (workspaces) {
        res.send({ workspaces })
    }
})

// Create a workspace
router.post('/', auth, validate(validations.createWorkspace), async (req, res) => {
    const [workspace] = await sql`
        insert into workspace (owner_email, workspace_name, workspace_colour)
        values ( ${req.user.email}, ${req.body.workspaceName},${req.body.workspaceColour} )
        on conflict (owner_email, workspace_name) do nothing
        returning *
    `
    if (!workspace) {
        res.status(400).send({
            errors: [{
                value: req.body.workspaceName,
                msg: `Workspace with name '${req.body.workspaceName}' already exists!`,
                param: "workspaceName",
                location: "body"
            }]
        })
    } else {
        res.status(201).send(toCamelCase(workspace))
    }
})

// Update workspace
router.patch('/:workspaceId', auth, validate(validations.updateWorkspace), async (req, res) => {
    // convert column names into format suitable for database
    const dbUpdates = toSnakeCase(req.body)
    
    const [workspace] = await sql`
        update workspace
        set ${sql(dbUpdates, ...Object.keys(dbUpdates))}
        where workspace_id = ${req.params.workspaceId}
        returning *
    `
    res.status(200).send(toCamelCase(workspace))
})

// Delete a workspace
router.delete('/:workspaceId', auth, validate(validations.deleteWorkspace), async (req, res) => {
    const [deletedWorkspace] = await sql`
        delete from workspace
        where workspace_id = ${req.params.workspaceId}
        returning *
    `
    if (deletedWorkspace) {
        res.status(200).send(toCamelCase(deletedWorkspace))
    }
})

module.exports = router