/**
 * Authentication seam for the cookie-based session architecture.
 *
 * Intended request flow once the authentication phase lands:
 *
 *   Request --(COOKIE_NAME cookie)--> requireAuth --(Session lookup)--> req.user --> Controller
 *
 * Nothing is verified yet: no session cookie is ever issued and no token is
 * ever decoded, so `requireAuth` unconditionally rejects. It deliberately does
 * NOT attach a placeholder user, because a fabricated `req.user` would let
 * every protected route appear to work.
 */
import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

/**
 * Shape attached to `req.user` once a session is resolved. This is an explicit
 * allow-list rather than the Prisma `User` model so `passwordHash` cannot be
 * selected into a request-scoped object by accident.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Columns to select when hydrating `req.user`. Phase 2 should reuse this so the
 * password hash is never read into memory.
 */
export const SESSION_USER_SELECT = {
  id: true,
  email: true,
  name: true,
} as const;

/**
 * Guard for authenticated routes.
 *
 * Phase 2 replaces the body below with: read the `env.cookieName` cookie, hash
 * it, look up a non-expired `Session`, then assign `req.user`.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  void req;
  next(
    ApiError.unauthorized(
      `Authentication is not implemented yet; no "${env.cookieName}" session cookie is ever issued.`,
    ),
  );
};
