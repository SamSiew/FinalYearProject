const { body, param, oneOf } = require('express-validator')
const { validate } = require('./helpers')
const { sql, toCamelCase } = require('../database')

// Module contains all validation and sanitisation logic for workspace routes

const checkWorkspaceParam = param('workspaceId').escape()
    .isNumeric({no_symbols: true}).withMessage('workspaceId must be an integer')

// checks that the workspace exists and the user owns the workspace
const checkValidWorkspaceId = [
    checkWorkspaceParam
    .bail()
    .custom(async (workspaceId, { req }) => {
        const [{owner_email: ownerEmail, ...rest} = {}] = await sql`
            select * from workspace where workspace_id = ${workspaceId}
        `
        if (!ownerEmail) {
            throw new Error('Workspace does not exist')
        }
        if (req.user.email !== ownerEmail) {
            throw new Error('User does not own this workspace')
        }

        if (!req.validationData) {
            req.validationData = {}
        }
        req.validationData.workspace = {
            ownerEmail,
            ...toCamelCase(rest)
        }
    })
]

const checkValidWorkspaceName = (
    body('workspaceName').optional().trim().escape()
    .isString().notEmpty().withMessage('workspaceName cannot be empty')
)

const checkValidWorkspaceColour = (
    body('workspaceColour').optional().trim().escape()
    .isHexColor().withMessage('workspaceColour must be a valid HEX colour')
)

const getWorkspace = [
    ...checkValidWorkspaceId
]

const createWorkspace = [
    checkValidWorkspaceName,
    checkValidWorkspaceColour
]

const updateWorkspace = [
    ...checkValidWorkspaceId,
    oneOf([
        body('workspaceName').exists(),
        body('workspaceColour').exists() 
    ], 'One of workspaceName or workspaceColour must be provided'),
    checkValidWorkspaceName,
    checkValidWorkspaceColour
]

const deleteWorkspace = [
    ...checkValidWorkspaceId
]

const validations = {
    updateWorkspace,
    getWorkspace,
    createWorkspace,
    deleteWorkspace
}

module.exports = {
    validations,
    validate,
    checkWorkspaceParam,
    checkValidWorkspaceId
}