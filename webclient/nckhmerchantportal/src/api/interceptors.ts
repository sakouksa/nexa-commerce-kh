import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { storage } from '../utils/storage';
import { normalizeAxiosError, AppApiError } from '../utils/errorHandler';

export function setupInterceptors(api: AxiosInstance): void {
  // Attach authorization token to outgoing requests
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = storage.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Centralized response handling and enterprise error normalization
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      const appError = normalizeAxiosError(error);

      // Provide backwards-compatible properties on appError so legacy catch blocks work seamlessly
      (appError as any).response = error?.response || {
        status: appError.status,
        data: {
          detail: appError.detail,
          message: appError.message,
          errors: appError.errors,
        },
      };

      // Auto-handle 401 Unauthorized
      if (appError.status === 401) {
        storage.clearAuth();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      return Promise.reject(appError);
    }
  );
}

export { AppApiError };
export default setupInterceptors;
