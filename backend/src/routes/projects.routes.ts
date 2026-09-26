/** Scaffolding for the project portfolio endpoints. */
import { Router } from 'express';

import { notImplemented } from '../controllers/placeholder.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const projectsRouter: Router = Router();

projectsRouter.use(requireAuth);
projectsRouter.use(notImplemented('Projects'));
