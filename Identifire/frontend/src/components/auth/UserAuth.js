import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Button } from '@material-ui/core'

import styles from './UserAuth.module.css'

// Component is login button that enables user to log in
export function LoginButton({children}) {
    const { loginWithRedirect } = useAuth0()

    const handleLogin = () => {
        loginWithRedirect()
    }

    return (
        <Button
            variant="contained"
            className={styles.loginButton}
            onClick={handleLogin}
        >
            {children}
        </Button>
    )
}

// Component is logout button that enables user to log out
export function LogoutButton({children}) {
    const { logout } = useAuth0()

    const handleLogout = () => {
        logout({ returnTo: window.location.origin})
    }

    return (
        <Button
            variant="outlined"
            className={styles.logoutButton}
            onClick={handleLogout}
        >
            {children}
        </Button>
    )
}

// Component combines both log in and log out buttons
export default function UserAuth() {
    const { isAuthenticated, isLoading } = useAuth0()

    if (!isAuthenticated || isLoading) {
        return (
            <div className={styles.authContainer}>
                <LoginButton> Signup </LoginButton>
                <LoginButton> Login </LoginButton>
            </div>
            
        )
    } else {
        return (
            <div className={styles.authContainer}>
                <LogoutButton>Logout</LogoutButton>
            </div>
            
        )
    }
    
}