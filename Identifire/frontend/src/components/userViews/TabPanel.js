import React from 'react'
import cn from 'classnames'

import styles from './TabPanel.module.css'

// This component allows users to switch between tabs by hiding other tabs and only
// showing the current tab

export default function TabPanel({ children, value, identifier, ...other }) {
    return (
        <div 
            className={cn(styles.tabPanel, {[styles.tabPanelHidden]: value !== identifier})}
            {...other}
        >
            {children}
        </div>
    )
}