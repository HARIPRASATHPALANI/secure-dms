import { apiFetch, getAuthToken, getReAuthToken } from './api.js';

export const documentService = {
  async getDocumentsByCase(caseId) {
    return await apiFetch(`/documents/case/${caseId}`);
  },

  async uploadDocument(formData) {
    const token = getAuthToken();
    const reauthToken = getReAuthToken('UPDATE');

    const response = await fetch('https://dms.haricloud.in/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-reauth-token': reauthToken || ''
      },
      body: formData
    });

    const data = await response.json().catch(() => ({ success: false, error: 'Upload failed' }));

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload document');
    }

    return data;
  },

  async getDocumentById(id) {
    return await apiFetch(`/documents/${id}`);
  },

  async downloadDocument(id) {
    const token = getAuthToken();

    const response = await fetch(
      `https://dms.haricloud.in/api/documents/${id}/download`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to download document');
    }

    const blob = await response.blob();

    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = 'document';

    const match = contentDisposition?.match(/filename="([^"]+)"/);
    if (match) {
      fileName = match[1];
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  }
};
