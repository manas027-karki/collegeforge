import type { AuthenticatedUser } from '../middleware/authMiddleware';

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by `requireAuth` once session verification is implemented.
       * Undefined for anonymous requests — never a fabricated user.
       */
      user?: AuthenticatedUser;
    }
  }
}

export {};
