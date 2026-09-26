/** Scaffolding for DSA problem and progress endpoints. */
import { Router } from 'express';

import { notImplemented } from '../controllers/placeholder.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const dsaRouter: Router = Router();

dsaRouter.use(requireAuth);
dsaRouter.use(notImplemented('DSA'));
