/**
 * Application pipeline endpoints, mounted at `/api/applications`:
 *
 *   GET    /        list the signed-in user's applications  -> 200
 *   POST   /        create an application                    -> 201
 *   GET    /:id     read one application                    -> 200
 *   PATCH  /:id     update an application, partially       -> 200
 *   PATCH  /:id/status update application status            -> 200
 *   DELETE /:id     delete an application                   -> 204
 *
 * `requireAuth` is applied to the whole router. An application is always
 * somebody's, and the only user is the one making the request.
 */
import { Router } from 'express';

import {
  createApplicationController,
  deleteApplicationController,
  getApplicationController,
  listApplicationsController,
  updateApplicationController,
  updateApplicationStatusController,
} from '../controllers/application.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const applicationsRouter: Router = Router();

applicationsRouter.use(requireAuth);

applicationsRouter.get('/', listApplicationsController);
applicationsRouter.post('/', createApplicationController);
applicationsRouter.get('/:id', getApplicationController);
applicationsRouter.patch('/:id', updateApplicationController);
applicationsRouter.patch('/:id/status', updateApplicationStatusController);
applicationsRouter.delete('/:id', deleteApplicationController);
