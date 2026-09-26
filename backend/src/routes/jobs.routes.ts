/** Scaffolding for the public job board endpoints. */
import { Router } from 'express';

import { notImplemented } from '../controllers/placeholder.controller';

export const jobsRouter: Router = Router();

jobsRouter.use(notImplemented('Jobs'));
