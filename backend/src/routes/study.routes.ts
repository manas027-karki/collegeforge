/**
 * Study planner endpoints, mounted at `/api/study`:
 *
 *   GET    /tasks          list the signed-in user's tasks      -> 200
 *   POST   /tasks          create a task                        -> 201
 *   GET    /tasks/:id      read one task                        -> 200
 *   PATCH  /tasks/:id      update a task, partially             -> 200
 *   POST   /tasks/:id/toggle  flip between To Do and Completed  -> 200
 *   DELETE /tasks/:id      delete a task                        -> 204
 *
 * `requireAuth` is applied to the whole router. A task is always
 * somebody's, and the only user is the one making the request.
 */
import { Router } from 'express';

import {
  createStudyTaskController,
  deleteStudyTaskController,
  getStudyTaskController,
  listStudyTasksController,
  toggleStudyTaskController,
  updateStudyTaskController,
} from '../controllers/studyTask.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const studyRouter: Router = Router();

studyRouter.use(requireAuth);

studyRouter.get('/tasks', listStudyTasksController);
studyRouter.post('/tasks', createStudyTaskController);
studyRouter.get('/tasks/:id', getStudyTaskController);
studyRouter.patch('/tasks/:id', updateStudyTaskController);
studyRouter.post('/tasks/:id/toggle', toggleStudyTaskController);
studyRouter.delete('/tasks/:id', deleteStudyTaskController);
