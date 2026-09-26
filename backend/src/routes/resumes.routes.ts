/** Scaffolding for resume metadata endpoints. File storage arrives later. */
import { Router } from 'express';

import { notImplemented } from '../controllers/placeholder.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const resumesRouter: Router = Router();

resumesRouter.use(requireAuth);
resumesRouter.use(notImplemented('Resumes'));
