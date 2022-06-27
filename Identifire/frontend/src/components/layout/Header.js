import React from 'react'
import { Typography, Link } from '@material-ui/core'
import { UserAuth } from '../auth'
import { ReactComponent as Logo } from './assets/logo.svg';

// Component is the main header of the application and holds navigation options as well as authentication options

import styles from './Header.module.css'

export default function Header() {
    return (
        <header
            className={styles.header}
        >
            <div className={styles.brandContainer}>
                <Logo className={styles.logo} />
                <Typography variant="h5" className={styles.productName}>
                    Identifire
                </Typography>
            </div>
            <nav className={styles.headerNav}>
                <Link className={styles.headerLink}
                      href={`${process.env.PUBLIC_URL}/predictive_modelling.html`}
                >
                    Predictive modelling
                </Link>
                <Link className={styles.headerLink}>About us</Link>
                <Link className={styles.headerLink}>Bushfire resources</Link>
                <Link className={styles.headerLink}>Help</Link>
                <UserAuth />
            </nav>
        </header>
    )
}