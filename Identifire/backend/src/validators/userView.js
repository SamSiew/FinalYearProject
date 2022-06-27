const { body, param, oneOf, validationResult, matchedData } = require('express-validator')
const { validate } = require('./helpers')
const { checkWorkspaceParam, checkValidWorkspaceId } = require('./workspace')
const { sql } = require('../database')

// Module contains all validation and sanitisation logic for user view routes

const checkViewParam = param('viewId').escape()
    .isNumeric({no_symbols: true}).withMessage('viewId must be an integer')

// 1. Does the workspace exist?
// 2. Does the view exist?
// 3. Does the view belong to the workspace?
// 4. Does the user own the workspace?
const checkValidUserViewRequest = [
    checkWorkspaceParam,
    checkViewParam,
    param()
    .custom(async (_, { req }) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // bail out of additional check as either
            // workspaceId or viewId is invalid
            return true
        }
        const { workspaceId, viewId } = matchedData(req, {locations: ['params']})
        const [{ownerEmail, ...view} = {}] = await sql`
            select 
                w.owner_email as "ownerEmail",
                uv.workspace_id as "workspaceId",
                uv.view_name as "viewName",
                uv.grid_layout as "gridLayout",
                uv.view_id as "viewId"
            from user_view uv 
                join workspace w using (workspace_id)
            where uv.view_id = ${viewId}
                and w.workspace_id = ${workspaceId}
        `

        if (!ownerEmail) {
            throw new Error('Invalid combination of workspaceId and viewId')
        }

        if (req.user.email !== ownerEmail) {
            throw new Error('User does not own this workspace')
        }

        if (!req.validationData) {
            req.validationData = {}
        }
        req.validationData.userView = { ...view }
    })
]

const getUserView = [
    ...checkValidUserViewRequest
]

const listUserViews = [
    checkWorkspaceParam
    .bail()
    .custom(async (workspaceId, { req }) => {
        const [{ownerEmail, viewId, ...rest} = {}, ...otherViews] = await sql`
            select 
                w.owner_email as "ownerEmail",
                uv.workspace_id as "workspaceId",
                uv.view_name as "viewName",
                uv.grid_layout as "gridLayout",
                uv.view_id as "viewId"
            from workspace w 
                left join user_view uv using (workspace_id)
            where w.workspace_id = ${workspaceId}
            order by uv.view_id
        `

        if (!ownerEmail) {
            throw new Error('Workspace does not exist')
        } else if (req.user.email !== ownerEmail) {
            throw new Error('User does not own this workspace')
        }

        if (!req.validationData) {
            req.validationData = {}
        }
        if (!viewId) {
            // workspace doesnt have any views
            req.validationData.userViews = []
        } else {
            const otherUserViews = otherViews.map(view => {
                delete view.ownerEmail
                return view
            })
            req.validationData.userViews = [{
                viewId,
                ...rest
            }, ...otherUserViews]
        }
    })
]

const createUserView = [
    ...checkValidWorkspaceId,
    body('viewName').trim().escape()
    .exists().withMessage('viewName must be provided')
    .isString().notEmpty().withMessage('viewName must not be empty')
]

const updateUserView = [
    ...checkValidUserViewRequest,
    oneOf([
        body('viewName').exists(),
        body('gridLayout').exists()
    ], 'One of viewName or gridLayout must be provided'),
    body('viewName').optional().trim().escape().isString().notEmpty().withMessage('viewName cannot be empty'),
    body('gridLayout').optional().isJSON({allow_primitives: true})
]

const deleteUserView = [
    ...checkValidUserViewRequest
]

const validations = {
    getUserView,
    listUserViews,
    createUserView,
    updateUserView,
    deleteUserView
}

module.exports = {
    validations,
    validate,
    checkValidUserViewRequest,
    checkViewParam
}