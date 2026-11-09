import axios, { AxiosProgressEvent } from 'axios';
import { normalizeAxiosError, AppApiError } from '../utils/errorHandler';

export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8003';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30-second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token and client request ID to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ms_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized response handling and enterprise error normalization
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const appError = normalizeAxiosError(err);

    // Provide backwards-compatible properties on appError so legacy catch blocks work seamlessly
    (appError as any).response = err?.response || {
      status: appError.status,
      data: {
        detail: appError.detail,
        message: appError.message,
        errors: appError.errors,
      },
    };

    // Auto-handle 401 Unauthorized or 403 Suspended session
    if (
      appError.status === 401 ||
      (appError.status === 403 && appError.detail?.toLowerCase().includes('suspended'))
    ) {
      localStorage.removeItem('ms_token');
      localStorage.removeItem('ms_user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/sign-in-admin') {
        window.location.href = '/sign-in-admin';
      }
    }

    return Promise.reject(appError);
  }
);

export const fullUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
};

export { AppApiError };
export type { AxiosProgressEvent };
export default api;
