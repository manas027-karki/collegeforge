/**
 * Error type carried from anywhere in the stack to `errorHandler`.
 *
 * Anything thrown that is *not* an `ApiError` is treated as unexpected: it is
 * logged server-side and reported to the client as a generic 500 so internal
 * details (SQL, stack traces, env values) never leak.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentication required.'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'You do not have access to this resource.'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found.'): ApiError {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(409, 'CONFLICT', message, details);
  }

  static notImplemented(message: string): ApiError {
    return new ApiError(501, 'NOT_IMPLEMENTED', message);
  }

  static internal(message = 'Internal server error.'): ApiError {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}
