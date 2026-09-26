/**
 * Global error handler. Must be mounted last, after `notFoundHandler`.
 *
 * Response contract (production never leaks internals):
 *   { success: false, message, code?, details?, stack? }
 *
 * `details` and `stack` are only attached outside production. Unexpected errors
 * are logged with full fidelity server-side and reported as a bare 500.
 */
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/httpResponse';

const exposeInternals = !env.isProduction;

const isBodyParserError = (err: unknown): boolean =>
  err instanceof SyntaxError && 'body' in err && 'status' in err;

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ApiError) {
    sendError(
      res,
      err.status,
      err.message,
      err.code,
      exposeInternals ? err.details : undefined,
      exposeInternals ? err.stack : undefined,
    );
    return;
  }

  if (err instanceof ZodError) {
    sendError(
      res,
      400,
      'Validation failed.',
      'VALIDATION_ERROR',
      exposeInternals
        ? err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          }))
        : undefined,
    );
    return;
  }

  if (isBodyParserError(err)) {
    sendError(res, 400, 'Request body contains invalid JSON.', 'INVALID_JSON');
    return;
  }

  console.error('[error] Unhandled error:', err);
  sendError(res, 500, 'Something went wrong', 'INTERNAL_SERVER_ERROR');
};
