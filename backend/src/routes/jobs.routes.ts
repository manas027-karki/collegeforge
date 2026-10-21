/**
 * Job board endpoints, mounted at `/api/jobs`:
 *
 *   GET /     list the job board, filtered and paginated -> 200
 *   GET /:id  read one job                              -> 200
 *
 * This router is deliberately **public**. The job board is a catalogue of
 * open positions anyone can browse, so it does not require a session.
 */
import { Router } from 'express';

import { getJobController, listJobsController } from '../controllers/job.controller';

export const jobsRouter: Router = Router();

jobsRouter.get('/', listJobsController);
jobsRouter.get('/:id', getJobController);
