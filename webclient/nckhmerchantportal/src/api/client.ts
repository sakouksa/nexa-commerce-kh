import axios, { AxiosProgressEvent } from 'axios';
import { setupInterceptors } from './interceptors';

export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8003';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure centralized interceptors (auth token, 401 redirect, 422 error normalization)
setupInterceptors(api);

export const fullUrl = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
};

export type { AxiosProgressEvent };
export default api;
