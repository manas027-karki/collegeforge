/**
 * DSA tracker endpoints, mounted at `/api/dsa`:
 *
 *   GET    /problems            list the user's problems, with progress -> 200
 *   POST   /problems            add a problem                          -> 201
 *   GET    /problems/:id        read one problem                       -> 200
 *   PATCH  /problems/:id        update a problem, partially            -> 200
 *   DELETE /problems/:id        delete a problem                       -> 204
 *   PATCH  /progress/:problemId update the user's progress on it       -> 200
 *
 * `requireAuth` is applied to the whole router. A problem belongs to the
 * user who added it, and the progress is always the signed-in user's.
 */
import { Router } from 'express';

import {
  createProblemController,
  deleteProblemController,
  getProblemController,
  listProblemsController,
  updateProblemController,
  updateProgressController,
} from '../controllers/dsa.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const dsaRouter: Router = Router();

dsaRouter.use(requireAuth);

dsaRouter.get('/problems', listProblemsController);
dsaRouter.post('/problems', createProblemController);
dsaRouter.get('/problems/:id', getProblemController);
dsaRouter.patch('/problems/:id', updateProblemController);
dsaRouter.delete('/problems/:id', deleteProblemController);
dsaRouter.patch('/progress/:problemId', updateProgressController);
