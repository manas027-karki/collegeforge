/**
 * Study task business logic.
 *
 * Every function takes the owning user's id and filters on it. That is the
 * tenant boundary: a task id from another account must not be readable,
 * writable, or deletable, and the filter lives here rather than being
 * repeated at each call site.
 */
import { prisma } from '../config/prisma';
import { Prisma, type StudyTask } from '../generated/prisma/client';
import type {
  CreateStudyTaskInput,
  UpdateStudyTaskInput,
} from '../validation/studyTask.schemas';

/**
 * Converts a `YYYY-MM-DD` date into a timestamp at UTC midnight.
 *
 * Storing UTC midnight means the date the user picked is the date that comes
 * back, no matter which timezone the browser is in.
 */
const toUtcDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

/** Lists every study task belonging to a user, soonest due first. */
export const listStudyTasks = async (userId: string): Promise<StudyTask[]> =>
  prisma.studyTask.findMany({
    where: { userId },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });

/** Reads one study task, scoped to its owner. */
export const findStudyTaskById = async (
  userId: string,
  taskId: string,
): Promise<StudyTask | null> =>
  prisma.studyTask.findFirst({
    where: { id: taskId, userId },
  });

/** Creates a study task for a user. */
export const createStudyTask = async (
  userId: string,
  input: CreateStudyTaskInput,
): Promise<StudyTask> =>
  prisma.studyTask.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      status: input.status,
      dueDate: toUtcDate(input.dueDate),
      category: input.category,
      estimatedMinutes: input.estimatedMinutes ?? null,
    },
  });

/**
 * Applies a partial update to one of the user's own tasks.
 *
 * Returns `null` when the task does not exist or belongs to somebody else.
 * The two cases are deliberately indistinguishable: telling them apart would
 * confirm that a task id exists.
 *
 * The write is assembled field by field so that "field absent" and "field
 * explicitly null" stay different things.
 */
export const updateStudyTask = async (
  userId: string,
  taskId: string,
  input: UpdateStudyTaskInput,
): Promise<StudyTask | null> => {
  const data: Prisma.StudyTaskUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.status !== undefined) data.status = input.status;
  if (input.category !== undefined) data.category = input.category;
  if (input.estimatedMinutes !== undefined) {
    data.estimatedMinutes = input.estimatedMinutes;
  }
  if (input.dueDate !== undefined) data.dueDate = toUtcDate(input.dueDate);

  // `updateMany` is used rather than `update` because it takes a plain
  // filter, which makes the owner check impossible to forget.
  const { count } = await prisma.studyTask.updateMany({
    where: { id: taskId, userId },
    data,
  });

  if (count === 0) {
    return null;
  }

  return prisma.studyTask.findUnique({ where: { id: taskId } });
};

/**
 * Flips a task between `TODO` and `COMPLETED`.
 *
 * The current status is read first, so the toggle is a decision rather than a
 * blind write. Returns `null` when the task does not exist or is not the
 * user's.
 */
export const toggleStudyTask = async (
  userId: string,
  taskId: string,
): Promise<StudyTask | null> => {
  const existing = await findStudyTaskById(userId, taskId);

  if (!existing) {
    return null;
  }

  const status = existing.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';

  const { count } = await prisma.studyTask.updateMany({
    where: { id: taskId, userId },
    data: { status },
  });

  if (count === 0) {
    return null;
  }

  return prisma.studyTask.findUnique({ where: { id: taskId } });
};

/**
 * Deletes one of the user's own tasks.
 *
 * Returns `false` when there was nothing to delete, so the controller can
 * answer 404 for both "never existed" and "not yours".
 */
export const deleteStudyTask = async (userId: string, taskId: string): Promise<boolean> => {
  const { count } = await prisma.studyTask.deleteMany({
    where: { id: taskId, userId },
  });

  return count > 0;
};
