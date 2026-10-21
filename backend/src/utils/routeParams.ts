/**
 * Helpers for reading route parameters.
 */
import type { Request } from 'express';

/**
 * Reads a route parameter as a string.
 *
 * Express types a parameter as `string | string[]` because a route pattern can
 * repeat a name, as in `/:id/:id`. None of the routes in this API do that, so
 * the array case is a mistake rather than something to handle, and the first
 * entry is the only sensible reading of it.
 */
export const routeParam = (req: Request, name: string): string => {
  const value = req.params[name];

  return Array.isArray(value) ? (value[0] ?? '') : value;
};
