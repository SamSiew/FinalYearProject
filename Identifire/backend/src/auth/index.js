const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa');

// File provides middleware for authentication

// Authorization middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
const checkJwt = jwt({
    // Dynamically provide a signing key
    // based on the kid in the header and 
    // the signing keys provided by the JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),

    // Validate the audience and the issuer.
    audience: `${process.env.AUTH0_AUDIENCE}`,
    issuer: `${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
});

const getUserEmail = (req, res, next) => {
    if (!req.user) {
        throw new Error('No user found in request')
    }
    req.user.email = req.user[`${process.env.AUTH0_NAMESPACE}/email`]
    next()
}

const auth = [checkJwt, getUserEmail]

module.exports = {
    auth,
    checkJwt,
    getUserEmail
}