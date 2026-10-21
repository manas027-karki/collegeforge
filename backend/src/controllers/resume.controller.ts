/**
 * Resume HTTP layer.
 *
 * Responsibilities stop at request parsing, status codes, and the response
 * envelope: the resume rules live in `services/resume.service.ts`.
 *
 * Handlers are `async` and rely on Express 5 forwarding rejected promises to
 * `errorHandler`, so a thrown `ApiError` becomes the standard
 * `{ success: false, message }` body.
 */
import type { Request, Response } from 'express';

import {
  createResume,
  deleteResume,
  findResumeById,
  listResumes,
  setCurrentResume,
  updateResume,
} from '../services/resume.service';
import { currentUser } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/httpResponse';
import { ApiError } from '../utils/ApiError';
import { routeParam } from '../utils/routeParams';
import {
  createResumeSchema,
  updateResumeSchema,
} from '../validation/resume.schemas';

/**
 * GET /api/resumes
 *
 * Lists the signed-in user's resumes, newest version first.
 */
export const listResumesController = async (req: Request, res: Response): Promise<void> => {
  const resumes = await listResumes(currentUser(req).id);

  sendSuccess(res, 'Resumes loaded.', { data: resumes });
};

/**
 * GET /api/resumes/:id
 *
 * 404 for a resume that does not exist *or* belongs to another account.
 */
export const getResumeController = async (req: Request, res: Response): Promise<void> => {
  const resume = await findResumeById(currentUser(req).id, routeParam(req, 'id'));

  if (!resume) {
    throw ApiError.notFound('Resume not found.');
  }

  sendSuccess(res, 'Resume loaded.', { data: resume });
};

/**
 * POST /api/resumes
 *
 * Creates a resume and makes it the current one. The version number is
 * assigned by the server.
 */
export const createResumeController = async (req: Request, res: Response): Promise<void> => {
  const input = createResumeSchema.parse(req.body);
  const resume = await createResume(currentUser(req).id, input);

  sendSuccess(res, 'Resume created.', { data: resume }, 201);
};

/**
 * PATCH /api/resumes/:id
 *
 * Applies a partial update and returns the stored resume.
 */
export const updateResumeController = async (req: Request, res: Response): Promise<void> => {
  const input = updateResumeSchema.parse(req.body);
  const resume = await updateResume(currentUser(req).id, routeParam(req, 'id'), input);

  if (!resume) {
    throw ApiError.notFound('Resume not found.');
  }

  sendSuccess(res, 'Resume updated.', { data: resume });
};

/**
 * POST /api/resumes/:id/current
 *
 * Makes a resume the current one and archives the others.
 *
 * This is its own endpoint rather than a PATCH with a status, because the
 * promotion has a side effect: everything else has to be archived, and that
 * does not belong in a field update.
 */
export const setCurrentResumeController = async (req: Request, res: Response): Promise<void> => {
  const resume = await setCurrentResume(currentUser(req).id, routeParam(req, 'id'));

  if (!resume) {
    throw ApiError.notFound('Resume not found.');
  }

  sendSuccess(res, 'Resume set as current.', { data: resume });
};

/**
 * DELETE /api/resumes/:id
 *
 * 204 on success, 404 when there was nothing to delete.
 */
export const deleteResumeController = async (req: Request, res: Response): Promise<void> => {
  const deleted = await deleteResume(currentUser(req).id, routeParam(req, 'id'));

  if (!deleted) {
    throw ApiError.notFound('Resume not found.');
  }

  res.status(204).send();
};
