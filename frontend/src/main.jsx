import React from 'react';
import ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import App from './App.jsx';
import './styles/index.css';
import { msalInstance, loginRequest } from './services/msalConfig.js';
import { setAuthToken } from './services/api.js';

async function startApp() {
  await msalInstance.initialize();

  try {
    const loginResponse = await msalInstance.handleRedirectPromise();

    let account = loginResponse?.account;

    if (!account) {
      const accounts = msalInstance.getAllAccounts();
      account = accounts.length > 0 ? accounts[0] : null;
    }

    if (account) {
      msalInstance.setActiveAccount(account);

      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account
      });

      setAuthToken(tokenResponse.accessToken);

      const user = {
        username: account.username,
        name: account.name || account.username
      };

      localStorage.setItem('dms_user', JSON.stringify(user));
    }
  } catch (error) {
    console.error('MSAL token acquisition error:', error);
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </React.StrictMode>
  );
}

startApp().catch((error) => {
  console.error('MSAL initialization error:', error);
});
