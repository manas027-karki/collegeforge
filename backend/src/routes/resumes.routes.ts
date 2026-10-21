/**
 * Resume endpoints, mounted at `/api/resumes`:
 *
 *   GET    /             list the signed-in user's resumes   -> 200
 *   POST   /             create a resume, and make it current -> 201
 *   GET    /:id          read one resume                    -> 200
 *   PATCH  /:id          update a resume, partially          -> 200
 *   POST   /:id/current  make a resume the current one      -> 200
 *   DELETE /:id          delete a resume                    -> 204
 *
 * `requireAuth` is applied to the whole router. A resume is always
 * somebody's, and the only user is the one making the request.
 */
import { Router } from 'express';

import {
  createResumeController,
  deleteResumeController,
  getResumeController,
  listResumesController,
  setCurrentResumeController,
  updateResumeController,
} from '../controllers/resume.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const resumesRouter: Router = Router();

resumesRouter.use(requireAuth);

resumesRouter.get('/', listResumesController);
resumesRouter.post('/', createResumeController);
resumesRouter.get('/:id', getResumeController);
resumesRouter.patch('/:id', updateResumeController);
resumesRouter.post('/:id/current', setCurrentResumeController);
resumesRouter.delete('/:id', deleteResumeController);
