const API_BASE = 'https://dms.haricloud.in/api';

export const getAuthToken = () => localStorage.getItem('dms_token');
export const setAuthToken = (token) => localStorage.setItem('dms_token', token);
export const removeAuthToken = () => {
  localStorage.removeItem('dms_token');
  localStorage.removeItem('dms_user');
  sessionStorage.removeItem('dms_reauth_UPDATE');
  sessionStorage.removeItem('dms_reauth_NEW_CASE');
};

export const getReAuthToken = (moduleName) => sessionStorage.getItem(`dms_reauth_${moduleName}`);
export const setReAuthToken = (moduleName, token) => sessionStorage.getItem(`dms_reauth_${moduleName}`, token) || sessionStorage.setItem(`dms_reauth_${moduleName}`, token);

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Include re-auth token if passed in options
  if (options.reauthModule) {
    const reauthToken = getReAuthToken(options.reauthModule);
    if (reauthToken) {
      headers['x-reauth-token'] = reauthToken;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({ success: false, error: 'Invalid server response' }));

  if (
  response.status === 401 &&
  !endpoint.includes('/auth/login') &&
  !endpoint.includes('/security/verify-reauth')
) {
  removeAuthToken();
  throw new Error('Session expired. Please login again.');
}

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
};
