/** Scaffolding for the authenticated application pipeline endpoints. */
import { Router } from 'express';

import { notImplemented } from '../controllers/placeholder.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const applicationsRouter: Router = Router();

applicationsRouter.use(requireAuth);
applicationsRouter.use(notImplemented('Applications'));
