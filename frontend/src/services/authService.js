import { msalInstance, loginRequest } from './msalConfig.js';
import { setAuthToken, removeAuthToken } from './api.js';

export const authService = {
  async login() {
    await msalInstance.loginRedirect(loginRequest);
  },

  async logout() {
    try {
      await msalInstance.logoutPopup();
    } catch (err) {
      console.warn('MSAL logout exception:', err.message);
    } finally {
      removeAuthToken();
      msalInstance.setActiveAccount(null);
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('dms_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('dms_token');
  }
};
