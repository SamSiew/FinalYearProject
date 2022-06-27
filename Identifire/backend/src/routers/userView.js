const Router = require('express-promise-router')
const { validate, validations } = require('../validators/userView')
const { auth } = require('../auth')
const { sql, toCamelCase, toSnakeCase } = require('../database')

// Module provides all routes for user views

const router = new Router({
    mergeParams: true 
})

// Get a view
router.get('/:viewId', auth, validate(validations.getUserView), async (req, res) => {
    const userView = req.validationData.userView
    res.send(userView)
})

// List all views
router.get('/', auth, validate(validations.listUserViews), async (req, res) => {
    const userViews = req.validationData.userViews
    res.send({ userViews })
})
 
// Create a view
router.post('/', auth, validate(validations.createUserView), async (req, res) => {
    const [newView] = await sql`
        insert into user_view (workspace_id, view_name)
        values (${req.params.workspaceId}, ${req.body.viewName})
        on conflict (workspace_id, view_name) do nothing
        returning *
    `
    if (!newView) {
        res.status(400).send({
            errors: [{
                value: req.body.viewName,
                msg: `View with name '${req.body.viewName}' already exists!`,
                param: "viewName",
                location: "body"
            }]
        })
    } else {
        res.status(201).send(toCamelCase(newView))
    }
})

// Update a view
router.patch('/:viewId', auth, validate(validations.updateUserView), async (req, res) => {
    // convert column names into format suitable for database
    if (req.body.gridLayout) {
        req.body.gridLayout = sql.json(req.body.gridLayout)
    }
    const dbUpdates = toSnakeCase(req.body)
    
    const [userView] = await sql`
        update user_view
        set ${sql(dbUpdates, ...Object.keys(dbUpdates))}
        where view_id = ${req.params.viewId}
        returning *
    `
    res.status(200).send(toCamelCase(userView))
})

// Delete a view
router.delete('/:viewId', auth, validate(validations.deleteUserView), async (req, res) => {
    const [deletedView] = await sql`
        delete from user_view
        where view_id = ${req.params.viewId}
        returning *
    `
    res.send(toCamelCase(deletedView))
})

module.exports = router