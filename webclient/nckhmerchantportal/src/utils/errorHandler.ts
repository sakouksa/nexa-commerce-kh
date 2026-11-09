/**
 * Centralized Application & API Error Handling Utility
 * Ensures every error preserves its exact HTTP status code, type, and field-level validation errors.
 */

export interface ApiErrorPayload {
  success?: boolean;
  status?: number;
  error?: string;
  message?: string;
  detail?: string | any[];
  errors?: Record<string, string[]> | null;
  request_id?: string;
}

export class AppApiError extends Error {
  public status: number;
  public code: string;
  public detail: string;
  public errors?: Record<string, string[]> | null;
  public requestId?: string;
  public isNetworkError: boolean;
  public isTimeout: boolean;
  public rawResponse?: any;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'ERROR',
    detail?: string,
    errors?: Record<string, string[]> | null,
    requestId?: string,
    isNetworkError: boolean = false,
    isTimeout: boolean = false,
    rawResponse?: any
  ) {
    super(message);
    this.name = 'AppApiError';
    this.status = status;
    this.code = code;
    this.detail = detail || message;
    this.errors = errors;
    this.requestId = requestId;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;
    this.rawResponse = rawResponse;

    // Restore prototype chain
    Object.setPrototypeOf(this, AppApiError.prototype);
  }
}

/**
 * Normalizes any Axios or network error into a standardized AppApiError
 */
export function normalizeAxiosError(err: any): AppApiError {
  if (!err) {
    return new AppApiError('Unknown error occurred', 500, 'UNKNOWN');
  }

  // Already normalized
  if (err instanceof AppApiError) {
    return err;
  }

  // Network Error / Offline (No HTTP Response)
  if (!err.response) {
    const isTimeout =
      err.code === 'ECONNABORTED' ||
      err.message?.toLowerCase().includes('timeout') ||
      err.message?.toLowerCase().includes('timed out');

    if (isTimeout) {
      return new AppApiError(
        'Request timed out. Please check your network and try again.',
        408,
        'REQUEST_TIMEOUT',
        'Request timed out. Please check your network and try again.',
        null,
        undefined,
        false,
        true,
        err
      );
    }

    return new AppApiError(
      'Unable to connect to the server. Please check your internet connection.',
      0,
      'NETWORK_ERROR',
      'Unable to connect to the server. Please check your internet connection.',
      null,
      undefined,
      true,
      false,
      err
    );
  }

  // HTTP Response from server
  const status = Number(err.response.status) || 500;
  const data = err.response.data as ApiErrorPayload | undefined;

  let message = 'An unexpected error occurred';
  let detail = '';
  let code = 'ERROR';
  let errors: Record<string, string[]> | null = null;
  const requestId = data?.request_id || (err.response.headers && err.response.headers['x-request-id']);

  if (typeof data === 'string') {
    message = data;
    detail = data;
  } else if (data && typeof data === 'object') {
    code = data.error || (status === 404 ? 'NOT_FOUND' : status === 422 ? 'VALIDATION_ERROR' : 'ERROR');

    // Field-level validation errors (HTTP 422)
    if (data.errors && typeof data.errors === 'object') {
      errors = data.errors;
    }

    // Extract detail or message
    if (typeof data.detail === 'string') {
      detail = data.detail;
      message = data.message || data.detail;
    } else if (Array.isArray(data.detail)) {
      // FastAPI style [{loc, msg}]
      detail = data.detail
        .map((d: any) => (d && typeof d === 'object' && d.msg ? d.msg : JSON.stringify(d)))
        .join('; ');
      message = detail;
    } else if (data.message) {
      message = data.message;
      detail = data.message;
    }
  }

  // Fallback messages according to HTTP status code
  if (!message || message === 'An unexpected error occurred') {
    switch (status) {
      case 400:
        message = 'Bad Request. The submitted data was invalid.';
        break;
      case 401:
        message = 'Authentication required or session expired.';
        break;
      case 403:
        message = 'Access forbidden. You do not have permission for this resource.';
        break;
      case 404:
        message = 'The requested resource was not found.';
        break;
      case 405:
        message = 'Method not allowed for this route.';
        break;
      case 409:
        message = 'Conflict. A duplicate record already exists.';
        break;
      case 413:
        message = 'Uploaded file is too large.';
        break;
      case 422:
        message = 'Validation failed. Please verify the entered information.';
        break;
      case 429:
        message = 'Too many requests. Please slow down and try again.';
        break;
      case 502:
        message = 'Bad Gateway. The upstream service is temporarily down.';
        break;
      case 503:
        message = 'Service Unavailable. System is undergoing maintenance.';
        break;
      case 504:
        message = 'Gateway Timeout. Server took too long to respond.';
        break;
      case 500:
      default:
        message = 'Internal Server Error. Please try again later.';
        break;
    }
  }

  return new AppApiError(
    message,
    status,
    code,
    detail || message,
    errors,
    requestId,
    false,
    false,
    err.response
  );
}

/**
 * Extracts a user-friendly error message from any error type
 */
export function getErrorMessage(err: unknown, fallback: string = 'An error occurred'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err instanceof AppApiError) return err.message || err.detail || fallback;

  const anyErr = err as any;
  if (anyErr?.response?.data) {
    const data = anyErr.response.data;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (typeof data.detail === 'string') return data.detail;
  }

  if (anyErr?.message) return anyErr.message;
  return fallback;
}

/**
 * Extracts HTTP status code safely from any error object
 */
export function getErrorStatus(err: unknown): number {
  if (!err) return 0;
  if (err instanceof AppApiError) return err.status;
  const anyErr = err as any;
  if (typeof anyErr.status === 'number') return anyErr.status;
  if (anyErr.response && typeof anyErr.response.status === 'number') return anyErr.response.status;
  return 0;
}

/**
 * Checks if the error is a 404 Not Found error
 */
export function isNotFoundError(err: unknown): boolean {
  return getErrorStatus(err) === 404;
}

/**
 * Checks if the error is a 403 Forbidden error
 */
export function isForbiddenError(err: unknown): boolean {
  return getErrorStatus(err) === 403;
}

/**
 * Checks if the error is a 401 Unauthorized error
 */
export function isUnauthorizedError(err: unknown): boolean {
  return getErrorStatus(err) === 401;
}

/**
 * Checks if the error is a 5xx Server Error
 */
export function isServerError(err: unknown): boolean {
  const status = getErrorStatus(err);
  return status >= 500 && status < 600;
}

/**
 * Checks if the error is a network or offline error
 */
export function isNetworkError(err: unknown): boolean {
  if (err instanceof AppApiError && err.isNetworkError) return true;
  return getErrorStatus(err) === 0;
}

/**
 * Extracts field-level validation errors (HTTP 422)
 */
export function getValidationErrors(err: unknown): Record<string, string[]> | null {
  if (!err) return null;
  if (err instanceof AppApiError && err.errors) return err.errors;
  const anyErr = err as any;
  if (anyErr?.response?.data?.errors && typeof anyErr.response.data.errors === 'object') {
    return anyErr.response.data.errors;
  }
  return null;
}
