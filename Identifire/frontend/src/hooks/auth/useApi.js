import { useEffect } from 'react'
import { useLazyApi } from './useLazyApi'

// useApi hook is a wrapper around useLazyApi

export const useApi = (url, {
    audience = process.env.REACT_APP_AUTH0_AUDIENCE,
    requestOptions = {},
    authenticate = true
} = {}) => {
    const [executeRequest, { loading, error, data, refetch } ] = useLazyApi(url, {
        audience,
        requestOptions,
        authenticate
    })

    // If url changes, execute request again
    useEffect(() => {
        executeRequest()
    }, [url])

    return {
        loading,
        error,
        data,
        refetch
    }

}