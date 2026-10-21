/**
 * DSA tracker HTTP layer.
 *
 * Responsibilities stop at request parsing, status codes, and the response
 * envelope: the tracker rules live in `services/dsa.service.ts`.
 *
 * Handlers are `async` and rely on Express 5 forwarding rejected promises to
 * `errorHandler`, so a thrown `ApiError` becomes the standard
 * `{ success: false, message }` body.
 */
import type { Request, Response } from 'express';

import {
  createProblem,
  deleteProblem,
  findProblemById,
  listProblems,
  updateProblem,
  updateProgress,
} from '../services/dsa.service';
import { currentUser } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/httpResponse';
import { ApiError } from '../utils/ApiError';
import { routeParam } from '../utils/routeParams';
import {
  createProblemSchema,
  updateProblemSchema,
  updateProgressSchema,
} from '../validation/dsa.schemas';

/**
 * GET /api/dsa/problems
 *
 * Lists the signed-in user's problems, each with their progress.
 */
export const listProblemsController = async (req: Request, res: Response): Promise<void> => {
  const problems = await listProblems(currentUser(req).id);

  sendSuccess(res, 'DSA problems loaded.', { data: problems });
};

/**
 * GET /api/dsa/problems/:id
 *
 * 404 for a problem that does not exist *or* belongs to another account.
 */
export const getProblemController = async (req: Request, res: Response): Promise<void> => {
  const problem = await findProblemById(currentUser(req).id, routeParam(req, 'id'));

  if (!problem) {
    throw ApiError.notFound('Problem not found.');
  }

  sendSuccess(res, 'Problem loaded.', { data: problem });
};

/**
 * POST /api/dsa/problems
 *
 * Adds a problem to the signed-in user's list.
 */
export const createProblemController = async (req: Request, res: Response): Promise<void> => {
  const input = createProblemSchema.parse(req.body);
  const problem = await createProblem(currentUser(req).id, input);

  sendSuccess(res, 'Problem added.', { data: problem }, 201);
};

/**
 * PATCH /api/dsa/problems/:id
 *
 * Applies a partial update and returns the stored problem.
 */
export const updateProblemController = async (req: Request, res: Response): Promise<void> => {
  const input = updateProblemSchema.parse(req.body);
  const problem = await updateProblem(currentUser(req).id, routeParam(req, 'id'), input);

  if (!problem) {
    throw ApiError.notFound('Problem not found.');
  }

  sendSuccess(res, 'Problem updated.', { data: problem });
};

/**
 * DELETE /api/dsa/problems/:id
 *
 * 204 on success, 404 when there was nothing to delete.
 */
export const deleteProblemController = async (req: Request, res: Response): Promise<void> => {
  const deleted = await deleteProblem(currentUser(req).id, routeParam(req, 'id'));

  if (!deleted) {
    throw ApiError.notFound('Problem not found.');
  }

  res.status(204).send();
};

/**
 * PATCH /api/dsa/progress/:problemId
 *
 * Updates the signed-in user's progress on one of their problems.
 */
export const updateProgressController = async (req: Request, res: Response): Promise<void> => {
  const input = updateProgressSchema.parse(req.body);
  const progress = await updateProgress(
    currentUser(req).id,
    routeParam(req, 'problemId'),
    input,
  );

  if (!progress) {
    throw ApiError.notFound('Problem not found.');
  }

  sendSuccess(res, 'Progress updated.', { data: progress });
};
