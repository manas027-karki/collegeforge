import type { AuthenticatedUser } from '../middleware/authMiddleware';

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by `requireAuth` from a verified, non-expired `Session` row.
       * Undefined for anonymous requests — never a fabricated user, and never
       * carrying `passwordHash` or the session token.
       */
      user?: AuthenticatedUser;
    }
  }
}

export {};
