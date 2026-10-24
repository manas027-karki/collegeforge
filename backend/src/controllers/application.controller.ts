/**
 * Application pipeline HTTP layer.
 *
 * Responsibilities stop at request parsing, status codes, and the response
 * envelope: the application rules live in `services/application.service.ts`.
 *
 * Handlers are `async` and rely on Express 5 forwarding rejected promises to
 * `errorHandler`, so a thrown `ApiError` becomes the standard
 * `{ success: false, message }` body.
 */
import type { Request, Response } from 'express';

import {
  createApplication,
  deleteApplication,
  findApplicationById,
  listApplications,
  updateApplication,
  updateApplicationStatus,
} from '../services/application.service';
import { currentUser } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/httpResponse';
import { ApiError } from '../utils/ApiError';
import {
  createApplicationSchema,
  updateApplicationSchema,
  updateApplicationStatusSchema,
} from '../validation/application.schemas';
import { routeParam } from '../utils/routeParams';

/**
 * GET /api/applications
 *
 * Lists the signed-in user's applications, newest first.
 */
export const listApplicationsController = async (req: Request, res: Response): Promise<void> => {
  const applications = await listApplications(currentUser(req).id);

  sendSuccess(res, 'Applications loaded.', { data: applications });
};

/**
 * GET /api/applications/:id
 *
 * 404 for an application that does not exist *or* belongs to another account.
 */
export const getApplicationController = async (req: Request, res: Response): Promise<void> => {
  const application = await findApplicationById(currentUser(req).id, routeParam(req, 'id'));

  if (!application) {
    throw ApiError.notFound('Application not found.');
  }

  sendSuccess(res, 'Application loaded.', { data: application });
};

/**
 * POST /api/applications
 *
 * Creates an application owned by the signed-in user.
 */
export const createApplicationController = async (req: Request, res: Response): Promise<void> => {
  const input = createApplicationSchema.parse(req.body);
  const application = await createApplication(currentUser(req).id, input);

  sendSuccess(res, 'Application created.', { data: application }, 201);
};

/**
 * PATCH /api/applications/:id
 *
 * Applies a partial update and returns the stored application, so the client can
 * replace its state with the authoritative values.
 */
export const updateApplicationController = async (req: Request, res: Response): Promise<void> => {
  const input = updateApplicationSchema.parse(req.body);
  const application = await updateApplication(currentUser(req).id, routeParam(req, 'id'), input);

  if (!application) {
    throw ApiError.notFound('Application not found.');
  }

  sendSuccess(res, 'Application updated.', { data: application });
};

/**
 * PATCH /api/applications/:id/status
 *
 * Updates just the status of an application.
 */
export const updateApplicationStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = updateApplicationStatusSchema.parse(req.body);
  const application = await updateApplicationStatus(currentUser(req).id, routeParam(req, 'id'), input);

  if (!application) {
    throw ApiError.notFound('Application not found.');
  }

  sendSuccess(res, 'Application status updated.', { data: application });
};

/**
 * DELETE /api/applications/:id
 *
 * 204 on success. Deleting an application that is already gone is reported as a
 * 404 rather than silently succeeding, so the client can tell the difference
 * between "deleted" and "never existed".
 */
export const deleteApplicationController = async (req: Request, res: Response): Promise<void> => {
  const deleted = await deleteApplication(currentUser(req).id, routeParam(req, 'id'));

  if (!deleted) {
    throw ApiError.notFound('Application not found.');
  }

  res.status(204).send();
};
