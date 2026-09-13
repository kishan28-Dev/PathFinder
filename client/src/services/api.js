import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Clerk attaches a global `window.Clerk` instance once loaded; reading the session
// token this way lets every request carry auth without threading getToken() through
// every call site.
api.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Request proceeds unauthenticated; the backend will reject with 401 and the
    // caller's normal error handling takes over.
  }
  return config;
});

// Normalizes any axios/network failure into a friendly, displayable message while
// preserving the status code for callers that need it (e.g. redirect on 401).
export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (!error.response) return 'Cannot reach the server. Please check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

export default api;
