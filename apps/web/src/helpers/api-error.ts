export interface ApiErrorDetail {
  code?: string | undefined;
  message?: string | undefined;
  errors?: unknown[] | undefined;
}

/**
 * Standardized API Request Error class across apps/web.
 */
export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly errors?: unknown[] | undefined;

  constructor(status: number, code: string, message: string, errors?: unknown[] | undefined) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export const createApiError = (
  status = 500,
  code = "INTERNAL_ERROR",
  message = "An unexpected error occurred",
  errors?: unknown[] | undefined,
): ApiRequestError => new ApiRequestError(status, code, message, errors);

export default ApiRequestError;
