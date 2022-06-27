const { param, body, oneOf, validationResult, matchedData } = require('express-validator')
const { validate } = require('./helpers')
const { checkValidUserViewRequest, checkViewParam } = require('./userView')
const { checkWorkspaceParam } = require('./workspace')
const { sql } = require('../database')

// Module contains all validation and sanitisation logic for user visualisation routes

const checkVisParam = param('userVisId').escape()
        .isNumeric({no_symbols: true}).withMessage('userVisId must be an integer')

// 1. Does the workspace exist?
// 2. Does the view exist?
// 3. Does the view belong to the workspace?
// 4. Does the user visualisation exist?
// 5. Does the user visualisation belong to the view?
// 6. Does the user own the workspace?
const checkValidUserVisRequest = [
    checkWorkspaceParam,
    checkViewParam,
    checkVisParam,
    param().custom(async (_, { req }) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                // bail out of additional check as either
                // workspaceId, viewId or userVisId is invalid
                return true
            }
            const { workspaceId, viewId, userVisId } = matchedData(req, {locations: ['params']})

            const [{ownerEmail, ...userVis} = {}] = await sql`
            select 
                w.owner_email as "ownerEmail",
                u_vis.user_vis_id as "userVisId",
                u_vis.view_id as "viewId",
                u_vis.measurement_id as "measurementId",
                u_vis.visualisation_name as "visualisationName",
                u_vis.vis_filter as "visFilter",
                u_vis.location_id as "locationId"
            from user_visualisation u_vis
                join user_view uv using (view_id)
                join workspace w using (workspace_id)
            where u_vis.user_vis_id = ${userVisId} 
                and uv.view_id = ${viewId}
                and w.workspace_id = ${workspaceId}
            `

            if (!ownerEmail) {
                throw new Error('Invalid combination of workspaceId, viewId and userVisId')
            }

            if (req.user.email !== ownerEmail) {
                throw new Error('User does not own this workspace')
            }

            if (!req.validationData) {
                req.validationData = {}
            }
            req.validationData.userVis = { ...userVis }
        })
]

const getUserVis = [
    ...checkValidUserVisRequest
]

const listUserVis = [
    checkWorkspaceParam,
    checkViewParam,
    param().custom(async (_, { req }) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // bail out of additional check as either
            // workspaceId, viewId is invalid
            return true
        }
        const { workspaceId, viewId } = matchedData(req, {locations: ['params']})
        const [{ownerEmail, userVisId, ...rest} = {}, ...otherVis] = await sql`
        select 
            w.owner_email as "ownerEmail",
            u_vis.user_vis_id as "userVisId",
            u_vis.view_id as "viewId",
            u_vis.measurement_id as "measurementId",
            u_vis.visualisation_name as "visualisationName",
            u_vis.vis_filter as "visFilter",
            u_vis.location_id as "locationId"
        from workspace w 
            join user_view uv using (workspace_id)
            left join user_visualisation u_vis using (view_id)
        where w.workspace_id = ${workspaceId}
            and uv.view_id = ${viewId}
        order by u_vis.user_vis_id
        `

        if (!ownerEmail) {
            throw new Error('Invalid combination of workspaceId and viewId')
        } else if (req.user.email !== ownerEmail) {
            throw new Error('User does not own this workspace')
        }

        if (!req.validationData) {
            req.validationData = {}
        }
        if (!userVisId) {
            // view does not have any visualisations
            req.validationData.userVisualisations = []
        } else {
            const otherVisualisations = otherVis.map(vis => {
                delete vis.ownerEmail
                return vis
            })
            req.validationData.userVisualisations = [{
                userVisId,
                ...rest
            }, ...otherVisualisations]
        }    
    })
]

const createUserVis = [
    ...checkValidUserViewRequest,
    body('locationId')
                    .trim().escape()
                    .exists().withMessage('locationId must be provided')
                    .isNumeric({no_symbols: true}).withMessage('locationId must be an integer'),
    body('measurementId')
                    .trim().escape()
                    .exists().withMessage('measurementId must be provided')
                    .isNumeric({no_symbols: true}).withMessage('measurementId must be an integer'),
    body('visualisationName')
                    .trim().escape()
                    .exists().withMessage('visualisationName must be provided')
                    .isString().notEmpty().withMessage('visualisationName cannot be empty'),
    body('visFilter')
                    .optional().isJSON({allow_primitives: true})
]

const updateUserVis = [
    ...checkValidUserVisRequest,
    oneOf([
        body('measurementId').exists(),
        body('visualisationName').exists(),
        body('visFilter').exists(),
        body('locationId').exists()
    ], 'One of [measurementId, visualisationName, visFilter, locationId] must be provided'),
    body('locationId')
                    .optional()
                    .trim().escape()
                    .isNumeric({no_symbols: true}).withMessage('locationId must be an integer'),
    body('measurementId')
                    .optional()
                    .trim().escape()
                    .isNumeric({no_symbols: true}).withMessage('measurementId must be an integer'),
    body('visualisationName')
                    .optional()
                    .trim().escape()
                    .isString().notEmpty().withMessage('visualisationName cannot be empty'),
    body('visFilter')
                    .optional()
                    .isJSON({allow_primitives: true})
]

const deleteUserVis = [
    ...checkValidUserVisRequest
]

const fetchUserVisData = [
    ...checkValidUserVisRequest
]

const validations = {
    getUserVis,
    listUserVis,
    createUserVis,
    updateUserVis,
    deleteUserVis,
    fetchUserVisData
}

module.exports = {
    validations,
    validate
}