/**
 * Authentication business logic: user lookup, password hashing and comparison,
 * and session lifecycle. Controllers stay thin and this module never touches
 * `req`/`res`, so the rules below are testable in isolation.
 *
 * Two invariants are enforced here rather than at the edges:
 *   1. `passwordHash` is never part of a returned value. The Prisma `select`
 *      keeps it out of memory, and every caller returns a `SafeUser`.
 *   2. The raw session token never reaches the database. Only
 *      `hashSessionToken(token)` is persisted.
 */
import bcrypt from 'bcrypt';

import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';
import type { LoginInput, RegisterInput } from '../validation/auth.schemas';
import { ApiError } from '../utils/ApiError';
import { generateSessionToken, getSessionExpiry, hashSessionToken } from '../utils/session';
import {
  SAFE_USER_SELECT,
  toSafeUser,
  type SafeUser,
} from './user.service';

/**
 * The safe-user projection and DTO live in `user.service.ts` — reading a user
 * without credentials is a profile concern, and the auth flow is only one of
 * its callers. They are re-exported here because the auth flow is the most
 * common consumer.
 */
export { SAFE_USER_SELECT, type SafeUser } from './user.service';

/** Extra column needed only to verify a password; never returned. */
const LOGIN_USER_SELECT = {
  ...SAFE_USER_SELECT,
  passwordHash: true,
} satisfies Prisma.UserSelect;

/** Non-sensitive request metadata recorded alongside the session. */
export interface SessionMetadata {
  userAgent: string | null;
  ipAddress: string | null;
}

/** A freshly created session: the raw token goes to the cookie, not the DB. */
export interface CreatedSession {
  token: string;
  expiresAt: Date;
}

export interface AuthResult {
  user: SafeUser;
  token: string;
  expiresAt: Date;
}

/** Identical message for "no such user" and "wrong password" (no enumeration). */
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';
const EMAIL_TAKEN_MESSAGE = 'An account with this email already exists.';

/**
 * A real bcrypt digest of a random throwaway string, used to spend roughly the
 * same time on a failed lookup as on a real comparison. Without it, an unknown
 * email would fail noticeably faster than a known one and leak which addresses
 * are registered. This is not a secret and grants no access.
 */
const DECOY_PASSWORD_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO8Ih1qk7XhBqWJ6oJ0j6Qk1nJdVnRZ0yS';

/** `user_agent` is `VarChar(256)` and `ip_address` is `VarChar(64)`. */
const truncate = (value: string | null | undefined, max: number): string | undefined =>
  value ? value.slice(0, max) : undefined;

const isUniqueViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

/**
 * Creates a session row for a user and returns the raw token for the cookie.
 *
 * The token is generated here, stored only as a digest, and handed back exactly
 * once. A user may hold several concurrent sessions (one per browser).
 */
export const createSession = async (
  userId: string,
  metadata: SessionMetadata,
  rememberMe = false,
): Promise<CreatedSession> => {
  const token = generateSessionToken();
  const expiresAt = getSessionExpiry(new Date(), rememberMe);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
      userAgent: truncate(metadata.userAgent, 256),
      ipAddress: truncate(metadata.ipAddress, 64),
    },
  });

  return { token, expiresAt };
};

/**
 * Resolves a raw cookie token to its user, or `null` when the session is
 * unknown or expired. An expired session is deleted on the spot and can never
 * authenticate, even if its row is still present.
 */
export const resolveSessionUser = async (rawToken: string): Promise<SafeUser | null> => {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(rawToken) },
    select: {
      id: true,
      expiresAt: true,
      user: { select: SAFE_USER_SELECT },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    // Scoped by `expiresAt` so a session re-issued for the same row is not
    // deleted out from under a concurrent request. Cleanup is best-effort:
    // failing to delete a dead row must not turn into a 500.
    await prisma.session
      .deleteMany({ where: { id: session.id, expiresAt: { lte: new Date() } } })
      .catch(() => undefined);

    return null;
  }

  return toSafeUser(session.user);
};

/**
 * Invalidates the session behind a raw token. Uses `deleteMany` so logging out
 * with an already-expired or already-revoked token is a no-op success rather
 * than an error.
 */
export const deleteSessionByToken = async (rawToken: string): Promise<void> => {
  await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(rawToken) } });
};

/** Revokes every session for a user. Used by the "log out everywhere" flow. */
export const deleteAllSessionsForUser = async (userId: string): Promise<void> => {
  await prisma.session.deleteMany({ where: { userId } });
};

/** Creates a user and signs them in with a new session. */
export const registerUser = async (
  input: RegisterInput,
  metadata: SessionMetadata,
): Promise<AuthResult> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw ApiError.conflict(EMAIL_TAKEN_MESSAGE);
  }

  // bcrypt is deliberately slow; hashing before the insert keeps the plaintext
  // lifetime as short as possible. Only the digest is ever written.
  const passwordHash = await bcrypt.hash(input.password, env.bcryptRounds);

  let user: SafeUser;

  try {
    user = toSafeUser(
      await prisma.user.create({
        data: { name: input.name, email: input.email, passwordHash },
        select: SAFE_USER_SELECT,
      }),
    );
  } catch (error) {
    // Two concurrent registrations can both pass the check above; the unique
    // index is the real arbiter. Report the conflict, not the database error.
    if (isUniqueViolation(error)) {
      throw ApiError.conflict(EMAIL_TAKEN_MESSAGE);
    }

    throw error;
  }

  const session = await createSession(user.id, metadata, input.rememberMe);

  return { user, ...session };
};

/**
 * Verifies credentials and signs the user in.
 *
 * Every failure path returns the same 401 so the endpoint cannot be used to
 * discover which email addresses have accounts.
 */
export const authenticateUser = async (
  input: LoginInput,
  metadata: SessionMetadata,
): Promise<AuthResult> => {
  const record = await prisma.user.findUnique({
    where: { email: input.email },
    select: LOGIN_USER_SELECT,
  });

  if (!record) {
    // Spend comparable time so an unknown email is not distinguishable by
    // response latency.
    await bcrypt.compare(input.password, DECOY_PASSWORD_HASH);

    throw ApiError.unauthorized(INVALID_CREDENTIALS_MESSAGE);
  }

  const passwordMatches = await bcrypt.compare(input.password, record.passwordHash);

  if (!passwordMatches) {
    throw ApiError.unauthorized(INVALID_CREDENTIALS_MESSAGE);
  }

  // Rebuilt field by field so `passwordHash` cannot ride along.
  const user = toSafeUser(record);
  const session = await createSession(user.id, metadata, input.rememberMe);

  return { user, ...session };
};
