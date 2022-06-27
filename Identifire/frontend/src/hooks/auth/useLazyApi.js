import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

// Hook enables authenticated access to backend API

export const useLazyApi = (url, {
    audience = process.env.REACT_APP_AUTH0_AUDIENCE,
    requestOptions = {},
    authenticate = true
} = {}) => {
    const { getAccessTokenSilently } = useAuth0()
    // Store the status of the request
    const [status, setStatus] = useState({
        loading: false,
        error: null,
        data: null
    })
    // Store the request options such as body or header options
    const [request, setRequest] = useState({
        authenticate,
        requestOptions
    })
    const [called, setCalled] = useState(false)

    // Function is called when a request is to be executed
    // The function can be configured with dynamic request options
    const executeRequest = (requestOptions = {}, authenticate) => {
        setCalled(true)
        setRequest({
            requestOptions: {
                ...request.requestOptions,
                ...requestOptions
            },
            authenticate: !authenticate ? request.authenticate : authenticate
        })
        setStatus({
            loading: true,
            error: null,
            data: null,
        })
    }

    // Function actually calls api with access token in header
    // It will set the status according to the outcome of the request
    const callApi = async () => {
        try {
            const {requestOptions, authenticate} = request
            let accessToken, response

            if (authenticate) {
                accessToken = await getAccessTokenSilently({ audience })

                response = await fetch(url, {
                    ...requestOptions,
                    headers: {
                        ...requestOptions.headers,
                        Authorization: `Bearer ${accessToken}`
                    }
                })
            } else {
                response = await fetch(url, {
                    ...requestOptions,
                    headers: {
                        ...requestOptions.headers
                    }
                })
            }
            
            if (!response.ok) {
                setStatus({
                    loading: false,
                    error: await response.json(),
                    data: null
                })
            } else {
                setStatus({
                    loading: false,
                    error: null,
                    data: await response.json()
                })
            }

        } catch (error) {
            setStatus({
                loading: false,
                error,
                data: null
            })
        }
    }


    // Listen to when loading changes (after executing a request)
    // and then send a request to the API
    useEffect(() => {
        (async () => {
            if (status.loading) {
                await callApi()
            }
        })()
    }, [status.loading])

    return [
        executeRequest,
        {
            ...status,
            called,
            refetch: (...params) => executeRequest(...params)
        }
    ]
}