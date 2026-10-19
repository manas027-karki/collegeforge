/**
 * Authentication HTTP layer. Responsibilities stop at request parsing, cookie
 * handling, status codes, and the response envelope: all credential and session
 * rules live in `services/auth.service.ts`.
 *
 * Handlers are `async` and rely on Express 5 forwarding rejected promises to
 * `errorHandler`, so a thrown `ApiError` becomes the standard
 * `{ success: false, message }` body.
 */
import type { Request, Response } from 'express';

import {
  authenticateUser,
  deleteSessionByToken,
  registerUser,
  type SessionMetadata,
} from '../services/auth.service';
import { clearSessionCookie, readSessionToken, setSessionCookie } from '../utils/session';
import { sendSuccess } from '../utils/httpResponse';
import { ApiError } from '../utils/ApiError';
import { loginSchema, registerSchema } from '../validation/auth.schemas';

/** Non-sensitive request context recorded against the session row. */
const sessionMetadataFrom = (req: Request): SessionMetadata => ({
  userAgent: req.get('user-agent') ?? null,
  ipAddress: req.ip ?? null,
});

/**
 * POST /api/auth/register
 *
 * 201 with the safe user; 409 when the email is already registered; 400 when
 * validation fails.
 */
export const registerController = async (req: Request, res: Response): Promise<void> => {
  const input = registerSchema.parse(req.body);
  const { user, token, expiresAt } = await registerUser(input, sessionMetadataFrom(req));

  setSessionCookie(res, token, expiresAt);
  sendSuccess(res, 'Account created successfully.', { user }, 201);
};

/**
 * POST /api/auth/login
 *
 * 200 with the safe user, or a generic 401 for any credential failure. The
 * session token appears only in the `Set-Cookie` header, never in the body.
 */
export const loginController = async (req: Request, res: Response): Promise<void> => {
  const input = loginSchema.parse(req.body);
  const { user, token, expiresAt } = await authenticateUser(input, sessionMetadataFrom(req));

  setSessionCookie(res, token, expiresAt);
  sendSuccess(res, 'Signed in successfully.', { user });
};

/**
 * GET /api/auth/me
 *
 * Behind `requireAuth`, so `req.user` is already a verified `SafeUser` and no
 * second lookup is needed. If a session expires between the middleware and this
 * handler, the cookie is cleared so the browser stops presenting it.
 */
export const meController = (req: Request, res: Response): void => {
  if (!req.user) {
    clearSessionCookie(res);
    throw ApiError.unauthorized('Not authenticated.');
  }

  sendSuccess(res, 'Authenticated.', { user: req.user });
};

/**
 * POST /api/auth/logout
 *
 * Always 200, including when the cookie is missing, expired, or already
 * revoked: logging out is a client-side state reset, not a failure. The cookie
 * is cleared unconditionally so a stale token cannot linger in the browser.
 */
export const logoutController = async (req: Request, res: Response): Promise<void> => {
  const token = readSessionToken(req);

  if (token) {
    await deleteSessionByToken(token);
  }

  clearSessionCookie(res);
  sendSuccess(res, 'Logged out successfully.');
};
