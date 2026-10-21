/**
 * Project portfolio endpoints, mounted at `/api/projects`:
 *
 *   GET    /        list the signed-in user's projects   -> 200
 *   GET    /:id     read one project                     -> 200
 *   POST   /        create a project                     -> 201
 *   PATCH  /:id     update a project, partially          -> 200
 *   DELETE /:id     delete a project                     -> 204
 *
 * `requireAuth` is applied to the whole router. A project is always
 * somebody's, and the only user is the one making the request.
 */
import { Router } from 'express';

import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
  updateProjectController,
} from '../controllers/project.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const projectsRouter: Router = Router();

projectsRouter.use(requireAuth);

projectsRouter.get('/', listProjectsController);
projectsRouter.post('/', createProjectController);
projectsRouter.get('/:id', getProjectController);
projectsRouter.patch('/:id', updateProjectController);
projectsRouter.delete('/:id', deleteProjectController);
