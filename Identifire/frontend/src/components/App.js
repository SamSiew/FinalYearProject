import React, { useState } from 'react'
import { CssBaseline } from '@material-ui/core'
import { WorkspaceDrawer, Header, ViewPanel } from './layout'
import styles from './App.module.css'

// Use this to get access token from user while testing
// import AccessTokenForTesting from './auth/AccessTokenForTesting'

function App() {
  const [selectedWorkspace, setSelectedWorkspace] = useState(null)
  return (
    <div>
      {/* <AccessTokenForTesting />  */}
      <CssBaseline />
      <Header/>
      <main className={styles.main}>
        <WorkspaceDrawer 
          onSelect={(workspace) => setSelectedWorkspace(workspace)}
        />
        <ViewPanel 
          workspaceId={selectedWorkspace?.workspaceId}
          workspaceName={selectedWorkspace?.workspaceName}
          workspaceColour={selectedWorkspace?.workspaceColour}
        />
      </main>
    </div>

  )
}

export default App;
