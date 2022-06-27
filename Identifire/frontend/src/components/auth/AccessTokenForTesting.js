import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

// Component can be used when testing to print the user's access token to the browser console
// See app.js to include this component

export default function AcessTokenForTesting() {
    const {loginWithRedirect, getAccessTokenSilently, isAuthenticated, isLoading} = useAuth0()

    const options = {
        audience: process.env.REACT_APP_AUTH0_AUDIENCE
    }

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            loginWithRedirect()
        }
    }, [isAuthenticated, isLoading])

    useEffect(() => {
        if (isAuthenticated) {
            getAccessTokenSilently(options).then(token => {
                console.log('User access token:')
                console.log(token)
            })
        }
    }, [isAuthenticated])

    return null
}