/**
 * Authentication endpoints, mounted at `/api/auth`:
 *
 *   POST /register   create an account and sign in   -> 201
 *   POST /login      verify credentials, sign in     -> 200
 *   POST /logout     invalidate the session           -> 200 (always)
 *   GET  /me         current user for the cookie      -> 200
 *
 * Rate limiting is intentionally deferred, but the split is already in place so
 * adding it later is a one-line change per route rather than a restructure:
 *
 *   authRouter.post('/login', authLimiter, loginController)
 *
 * Keep `requireAuth` scoped to the routes that need it. It is deliberately not
 * applied router-wide, because `/login` and `/register` must stay reachable to
 * anonymous callers.
 */
import { Router } from 'express';

import { loginController, logoutController, meController, registerController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const authRouter: Router = Router();

authRouter.post('/register', registerController);
authRouter.post('/login', loginController);
authRouter.post('/logout', logoutController);
authRouter.get('/me', requireAuth, meController);
