/**
 * Session primitives: opaque token generation, hashing, expiry, and the
 * HTTP-only cookie that carries the token to the browser.
 *
 * The split matters for security. The raw token exists only in the HTTP
 * response and in the browser's cookie jar; PostgreSQL only ever receives a
 * SHA-256 digest. A database leak therefore cannot be replayed as a live
 * session, and because the cookie is `httpOnly` the page's JavaScript cannot
 * read the token either.
 */
import { createHash, randomBytes } from 'node:crypto';

import type { CookieOptions, Request, Response } from 'express';

import { env } from '../config/env';

/** 32 bytes = 256 bits of entropy, encoded base64url for cookie safety. */
const SESSION_TOKEN_BYTES = 32;

/**
 * Cookie attributes shared by set and clear.
 *
 * Clearing must repeat these or the browser will keep the original cookie:
 * a `Set-Cookie` only replaces a cookie when name, domain, and path match.
 *
 * `secure` follows the environment rather than being hardcoded, so local HTTP
 * development keeps working while production is HTTPS-only.
 */
const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.cookieSameSite,
  path: '/',
};

/** Cryptographically random, unguessable session token. Never persisted raw. */
export const generateSessionToken = (): string =>
  randomBytes(SESSION_TOKEN_BYTES).toString('base64url');

/**
 * SHA-256 digest of a session token, hex encoded to exactly 64 characters to
 * match `Session.tokenHash @db.Char(64)`.
 *
 * SHA-256 is the right primitive here (unlike the raw token, the input has full
 * entropy), so a slow KDF would only add latency without adding security.
 */
export const hashSessionToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

/** Absolute expiry for a newly created session, from `SESSION_DURATION_DAYS`. */
export const getSessionExpiry = (now: Date = new Date()): Date =>
  new Date(now.getTime() + env.sessionDurationDays * 24 * 60 * 60 * 1000);

/** Reads the raw token from the request cookie, or `null` when absent. */
export const readSessionToken = (req: Request): string | null => {
  const value = (req.cookies as Record<string, unknown> | undefined)?.[env.cookieName];

  return typeof value === 'string' && value.length > 0 ? value : null;
};

/** Issues the session cookie. `httpOnly` keeps it out of reach of page scripts. */
export const setSessionCookie = (res: Response, token: string, expiresAt: Date): void => {
  res.cookie(env.cookieName, token, { ...sessionCookieOptions, expires: expiresAt });
};

/** Removes the session cookie from the browser. Safe to call unconditionally. */
export const clearSessionCookie = (res: Response): void => {
  res.clearCookie(env.cookieName, { ...sessionCookieOptions });
};
