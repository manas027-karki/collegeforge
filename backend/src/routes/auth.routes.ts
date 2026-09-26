/**
 * Scaffolding for the authentication endpoints (register, login, logout,
 * session). The HTTP-only session cookie is not issued yet, so every route here
 * is intentionally unavailable rather than partially working.
 */
import { Router } from 'express';

import { notImplemented } from '../controllers/placeholder.controller';

export const authRouter: Router = Router();

authRouter.use(notImplemented('Authentication'));
