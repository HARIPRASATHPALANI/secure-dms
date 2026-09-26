import { apiFetch, setReAuthToken } from './api.js';

export const securityService = {
  async verifyReAuth(username, password, moduleName) {
    try {
      const data = await apiFetch('/security/verify-reauth', {
        method: 'POST',
        body: JSON.stringify({ username, password, moduleName })
      });

      if (data.success && data.reauthToken) {
        setReAuthToken(moduleName, data.reauthToken);
      }

      return data;
    } catch (err) {
      throw err;
    }
  },

  async getAuditLogs() {
    return await apiFetch('/audit-logs');
  }
};
