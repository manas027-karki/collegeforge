/**
 * Authentication seam for the cookie-based session architecture.
 *
 *   Request --(COOKIE_NAME cookie)--> requireAuth --(Session lookup)--> req.user --> Controller
 *
 * The guard resolves the cookie to a live session. A missing, unknown, or
 * expired session all produce the same 401 and the controller is never reached.
 * Nothing is ever fabricated: `req.user` is set only from a verified database
 * row.
 */
import type { NextFunction, Request, Response } from 'express';

import { resolveSessionUser, type SafeUser } from '../services/auth.service';
import { clearSessionCookie, readSessionToken } from '../utils/session';
import { ApiError } from '../utils/ApiError';

/**
 * Shape attached to `req.user`. Mirrors `SafeUser`: identity and profile only,
 * with no password hash and no session token. `requireAuth` populates it from
 * the `SAFE_USER_SELECT` projection, so `passwordHash` is never even read.
 */
export type AuthenticatedUser = SafeUser;

/**
 * Columns to select when hydrating `req.user`. Re-exported from the user
 * service so the middleware and the response DTO cannot drift apart.
 */
export { SAFE_USER_SELECT } from '../services/user.service';

/**
 * Returns the authenticated user, or throws.
 *
 * `requireAuth` has already resolved the session by the time a controller
 * runs, so this is a type narrowing rather than a second check. It is
 * exported so every authenticated controller does not repeat the same guard.
 */
export const currentUser = (req: Request): AuthenticatedUser => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated.');
  }

  return req.user;
};

const SESSION_REQUIRED_MESSAGE = 'Authentication required.';
const SESSION_EXPIRED_MESSAGE = 'Session expired. Please sign in again.';

/**
 * Guard for authenticated routes.
 *
 * On failure the response is a 401 in the standard error envelope. The session
 * cookie is also cleared so the browser stops replaying a token that can no
 * longer authenticate — without that, a refresh would loop on the same dead
 * cookie.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = readSessionToken(req);

  if (!token) {
    next(ApiError.unauthorized(SESSION_REQUIRED_MESSAGE));
    return;
  }

  let user: AuthenticatedUser | null;

  try {
    user = await resolveSessionUser(token);
  } catch (error) {
    // A database failure must not look like a valid session.
    next(error);
    return;
  }

  if (!user) {
    clearSessionCookie(res);
    next(ApiError.unauthorized(SESSION_EXPIRED_MESSAGE));
    return;
  }

  req.user = user;
  next();
};
