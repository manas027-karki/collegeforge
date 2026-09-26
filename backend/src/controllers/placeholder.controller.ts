/**
 * Placeholder handler for route modules that are scaffolded but not built yet.
 *
 * It exists so the routing table is explicit and every unimplemented endpoint
 * fails loudly with 501 instead of silently 404-ing or returning mock data.
 */
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../utils/ApiError';

export const notImplemented = (resource: string) => {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next(ApiError.notImplemented(`${resource} API is not implemented yet.`));
  };
};
