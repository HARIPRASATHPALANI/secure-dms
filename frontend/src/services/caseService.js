import { apiFetch } from './api.js';

export const caseService = {
  async getCases(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await apiFetch(`/cases${query ? `?${query}` : ''}`);
  },

  async getCaseById(id) {
    return await apiFetch(`/cases/${id}`);
  },

  async getMetrics() {
    return await apiFetch('/cases/metrics');
  },

  async createCase(caseData) {
    return await apiFetch('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
      reauthModule: 'NEW_CASE'
    });
  }
};
