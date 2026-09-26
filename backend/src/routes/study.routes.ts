/** Scaffolding for the study planner endpoints. */
import { Router } from 'express';

import { notImplemented } from '../controllers/placeholder.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const studyRouter: Router = Router();

studyRouter.use(requireAuth);
studyRouter.use(notImplemented('Study'));
