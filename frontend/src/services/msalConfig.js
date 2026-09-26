import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '5cf96655-b008-42cf-99ad-29203b8d7310',
    authority: 'https://login.microsoftonline.com/8c37f683-4650-4f96-a8f6-913074d31bdf',
   redirectUri: 'https://dms.haricloud.in/'
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
};

export const loginRequest = {
  scopes: [
    'api://43af1ad1-05d2-40c3-b9ed-058af584f1ec/access_as_user'
  ]
};

export const msalInstance = new PublicClientApplication(msalConfig);
