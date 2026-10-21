/**
 * Study task HTTP layer.
 *
 * Responsibilities stop at request parsing, status codes, and the response
 * envelope: the planner rules live in `services/studyTask.service.ts`.
 *
 * Handlers are `async` and rely on Express 5 forwarding rejected promises to
 * `errorHandler`, so a thrown `ApiError` becomes the standard
 * `{ success: false, message }` body.
 */
import type { Request, Response } from 'express';

import {
  createStudyTask,
  deleteStudyTask,
  findStudyTaskById,
  listStudyTasks,
  toggleStudyTask,
  updateStudyTask,
} from '../services/studyTask.service';
import { currentUser } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/httpResponse';
import { ApiError } from '../utils/ApiError';
import { routeParam } from '../utils/routeParams';
import {
  createStudyTaskSchema,
  updateStudyTaskSchema,
} from '../validation/studyTask.schemas';

/**
 * GET /api/study/tasks
 *
 * Lists the signed-in user's tasks, soonest due first.
 */
export const listStudyTasksController = async (req: Request, res: Response): Promise<void> => {
  const tasks = await listStudyTasks(currentUser(req).id);

  sendSuccess(res, 'Study tasks loaded.', { data: tasks });
};

/**
 * GET /api/study/tasks/:id
 *
 * 404 for a task that does not exist *or* belongs to another account.
 */
export const getStudyTaskController = async (req: Request, res: Response): Promise<void> => {
  const task = await findStudyTaskById(currentUser(req).id, routeParam(req, 'id'));

  if (!task) {
    throw ApiError.notFound('Study task not found.');
  }

  sendSuccess(res, 'Study task loaded.', { data: task });
};

/**
 * POST /api/study/tasks
 *
 * Creates a task owned by the signed-in user.
 */
export const createStudyTaskController = async (req: Request, res: Response): Promise<void> => {
  const input = createStudyTaskSchema.parse(req.body);
  const task = await createStudyTask(currentUser(req).id, input);

  sendSuccess(res, 'Study task created.', { data: task }, 201);
};

/**
 * PATCH /api/study/tasks/:id
 *
 * Applies a partial update and returns the stored task.
 */
export const updateStudyTaskController = async (req: Request, res: Response): Promise<void> => {
  const input = updateStudyTaskSchema.parse(req.body);
  const task = await updateStudyTask(currentUser(req).id, routeParam(req, 'id'), input);

  if (!task) {
    throw ApiError.notFound('Study task not found.');
  }

  sendSuccess(res, 'Study task updated.', { data: task });
};

/**
 * POST /api/study/tasks/:id/toggle
 *
 * Flips a task between `TODO` and `COMPLETED`.
 *
 * A toggle is its own endpoint rather than a PATCH with a status, because
 * the client should not have to know the current status to ask for the next
 * one.
 */
export const toggleStudyTaskController = async (req: Request, res: Response): Promise<void> => {
  const task = await toggleStudyTask(currentUser(req).id, routeParam(req, 'id'));

  if (!task) {
    throw ApiError.notFound('Study task not found.');
  }

  sendSuccess(res, 'Study task updated.', { data: task });
};

/**
 * DELETE /api/study/tasks/:id
 *
 * 204 on success, 404 when there was nothing to delete.
 */
export const deleteStudyTaskController = async (req: Request, res: Response): Promise<void> => {
  const deleted = await deleteStudyTask(currentUser(req).id, routeParam(req, 'id'));

  if (!deleted) {
    throw ApiError.notFound('Study task not found.');
  }

  res.status(204).send();
};
