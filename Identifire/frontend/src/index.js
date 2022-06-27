import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from '@auth0/auth0-react'
import { StylesProvider } from '@material-ui/core/styles'
import App from './components/App';

// Import fonts for material ui
import 'fontsource-roboto/300.css'
import 'fontsource-roboto/400.css'
import 'fontsource-roboto/500.css'
import 'fontsource-roboto/700.css'

import './index.css';

ReactDOM.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN}
    clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
    redirectUri={window.location.origin}
    audience={process.env.REACT_APP_AUTH0_AUDIENCE}
    scope="read:current_user update:current_user_metadata"
  >
    <React.StrictMode>
      <StylesProvider injectFirst>
        <App />
      </StylesProvider>
    </React.StrictMode>
  </Auth0Provider>,
  document.getElementById('root')
);

