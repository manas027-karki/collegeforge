/**
 * Project portfolio HTTP layer.
 *
 * Responsibilities stop at request parsing, status codes, and the response
 * envelope: the portfolio rules live in `services/project.service.ts`.
 *
 * Handlers are `async` and rely on Express 5 forwarding rejected promises to
 * `errorHandler`, so a thrown `ApiError` becomes the standard
 * `{ success: false, message }` body.
 */
import type { Request, Response } from 'express';

import {
  createProject,
  deleteProject,
  findProjectById,
  listProjects,
  updateProject,
} from '../services/project.service';
import { currentUser } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/httpResponse';
import { ApiError } from '../utils/ApiError';
import { createProjectSchema, updateProjectSchema } from '../validation/project.schemas';
import { routeParam } from '../utils/routeParams';

/**
 * GET /api/projects
 *
 * Lists the signed-in user's projects, newest first.
 */
export const listProjectsController = async (req: Request, res: Response): Promise<void> => {
  const projects = await listProjects(currentUser(req).id);

  sendSuccess(res, 'Projects loaded.', { data: projects });
};

/**
 * GET /api/projects/:id
 *
 * 404 for a project that does not exist *or* belongs to another account.
 */
export const getProjectController = async (req: Request, res: Response): Promise<void> => {
  const project = await findProjectById(currentUser(req).id, routeParam(req, 'id'));

  if (!project) {
    throw ApiError.notFound('Project not found.');
  }

  sendSuccess(res, 'Project loaded.', { data: project });
};

/**
 * POST /api/projects
 *
 * Creates a project owned by the signed-in user.
 */
export const createProjectController = async (req: Request, res: Response): Promise<void> => {
  const input = createProjectSchema.parse(req.body);
  const project = await createProject(currentUser(req).id, input);

  sendSuccess(res, 'Project created.', { data: project }, 201);
};

/**
 * PATCH /api/projects/:id
 *
 * Applies a partial update and returns the stored project, so the client can
 * replace its state with the authoritative values.
 */
export const updateProjectController = async (req: Request, res: Response): Promise<void> => {
  const input = updateProjectSchema.parse(req.body);
  const project = await updateProject(currentUser(req).id, routeParam(req, 'id'), input);

  if (!project) {
    throw ApiError.notFound('Project not found.');
  }

  sendSuccess(res, 'Project updated.', { data: project });
};

/**
 * DELETE /api/projects/:id
 *
 * 204 on success. Deleting a project that is already gone is reported as a
 * 404 rather than silently succeeding, so the client can tell the difference
 * between "deleted" and "never existed".
 */
export const deleteProjectController = async (req: Request, res: Response): Promise<void> => {
  const deleted = await deleteProject(currentUser(req).id, routeParam(req, 'id'));

  if (!deleted) {
    throw ApiError.notFound('Project not found.');
  }

  res.status(204).send();
};
