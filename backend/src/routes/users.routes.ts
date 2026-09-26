/** Scaffolding for the authenticated user profile endpoints. */
import { Router } from 'express';

import { notImplemented } from '../controllers/placeholder.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const usersRouter: Router = Router();

usersRouter.use(requireAuth);
usersRouter.use(notImplemented('Users'));
