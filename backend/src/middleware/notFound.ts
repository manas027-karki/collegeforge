/**
 * Terminal 404 handler. Mounted after every route so any request that matches
 * no router falls through to here and gets the standard error envelope.
 */
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/ApiError';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist.`));
};
