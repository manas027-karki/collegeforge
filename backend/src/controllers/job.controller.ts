/**
 * Job board HTTP layer.
 *
 * This router is **public**. The job board is a catalogue of open positions
 * that anyone can browse, so nothing here requires a session. Everything a
 * user owns — their applications, their saved jobs — lives behind
 * `requireAuth` on its own router.
 */
import type { Request, Response } from 'express';

import { findJobById, listJobs } from '../services/job.service';
import { sendSuccess } from '../utils/httpResponse';
import { ApiError } from '../utils/ApiError';
import { routeParam } from '../utils/routeParams';
import { jobQuerySchema } from '../validation/job.schemas';

/**
 * GET /api/jobs
 *
 * Lists the job board, filtered, sorted and paginated.
 */
export const listJobsController = async (req: Request, res: Response): Promise<void> => {
  const query = jobQuerySchema.parse(req.query);
  const result = await listJobs(query);

  sendSuccess(res, 'Jobs loaded.', result);
};

/**
 * GET /api/jobs/:id
 *
 * 404 for a job that does not exist.
 */
export const getJobController = async (req: Request, res: Response): Promise<void> => {
  const job = await findJobById(routeParam(req, 'id'));

  if (!job) {
    throw ApiError.notFound('Job not found.');
  }

  sendSuccess(res, 'Job loaded.', { data: job });
};
