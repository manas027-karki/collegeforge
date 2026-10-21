/**
 * DSA tracker business logic.
 *
 * A problem and a user's progress on it are two different things, and this
 * module keeps them apart:
 *
 *   - A `DSAProblem` belongs to the user who added it, like every other
 *     resource in the app.
 *   - A `DSAProgress` is the signed-in user's status and attempt count on a
 *     problem. There is at most one per user and problem.
 *
 * Every function takes the owning user's id and filters on it, so one
 * account can never read or write another account's problems.
 */
import { prisma } from '../config/prisma';
import {
  Prisma,
  type DSAProblem,
  type DSAProgress,
  type DSASolveStatus,
} from '../generated/prisma/client';
import type {
  CreateProblemInput,
  UpdateProblemInput,
  UpdateProgressInput,
} from '../validation/dsa.schemas';

/**
 * A problem together with the signed-in user's progress on it.
 *
 * The list endpoint returns this shape so the screen needs a single request
 * rather than one for the problems and another for the progress.
 */
export interface ProblemWithProgress extends DSAProblem {
  progress: DSAProgress | null;
}

/**
 * Lists the user's problems, each with their progress, newest first.
 */
export const listProblems = async (userId: string): Promise<ProblemWithProgress[]> => {
  const [problems, progress] = await Promise.all([
    prisma.dSAProblem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dSAProgress.findMany({ where: { userId } }),
  ]);

  const progressByProblem = new Map(progress.map((entry) => [entry.problemId, entry]));

  return problems.map((problem) => ({
    ...problem,
    progress: progressByProblem.get(problem.id) ?? null,
  }));
};

/** Reads one of the user's problems, scoped to its owner. */
export const findProblemById = async (
  userId: string,
  problemId: string,
): Promise<ProblemWithProgress | null> => {
  const problem = await prisma.dSAProblem.findFirst({
    where: { id: problemId, userId },
  });

  if (!problem) {
    return null;
  }

  const progress = await prisma.dSAProgress.findUnique({
    where: { userId_problemId: { userId, problemId } },
  });

  return { ...problem, progress };
};

/** Adds a problem for a user. */
export const createProblem = async (
  userId: string,
  input: CreateProblemInput,
): Promise<DSAProblem> =>
  prisma.dSAProblem.create({
    data: {
      userId,
      title: input.title,
      difficulty: input.difficulty,
      topic: input.topic,
      platform: input.platform,
      url: input.url,
    },
  });

/**
 * Applies a partial update to one of the user's own problems.
 *
 * Returns `null` when the problem does not exist or belongs to somebody
 * else. The two cases are deliberately indistinguishable.
 */
export const updateProblem = async (
  userId: string,
  problemId: string,
  input: UpdateProblemInput,
): Promise<DSAProblem | null> => {
  const data: Prisma.DSAProblemUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.difficulty !== undefined) data.difficulty = input.difficulty;
  if (input.topic !== undefined) data.topic = input.topic;
  if (input.platform !== undefined) data.platform = input.platform;
  if (input.url !== undefined) data.url = input.url;

  // `updateMany` is used rather than `update` because it takes a plain
  // filter, which makes the owner check impossible to forget.
  const { count } = await prisma.dSAProblem.updateMany({
    where: { id: problemId, userId },
    data,
  });

  if (count === 0) {
    return null;
  }

  return prisma.dSAProblem.findUnique({ where: { id: problemId } });
};

/**
 * Deletes one of the user's own problems.
 *
 * The progress rows for it cascade, which is safe now that a problem has a
 * single owner.
 */
export const deleteProblem = async (userId: string, problemId: string): Promise<boolean> => {
  const { count } = await prisma.dSAProblem.deleteMany({
    where: { id: problemId, userId },
  });

  return count > 0;
};

/**
 * Updates the signed-in user's progress on one of their problems.
 *
 * The status is set to whatever the client asked for, and marking a problem
 * solved stamps the time it was solved. The attempt count is incremented by
 * the server rather than set by the client, so two devices recording an
 * attempt at the same moment cannot lose one between them.
 */
export const updateProgress = async (
  userId: string,
  problemId: string,
  input: UpdateProgressInput,
): Promise<DSAProgress | null> => {
  // The problem has to exist and belong to the user, or there is nothing to
  // make progress on. Checked here so the caller can answer 404 rather than
  // letting the foreign key fail as a 500.
  const problem = await prisma.dSAProblem.findFirst({
    where: { id: problemId, userId },
    select: { id: true },
  });

  if (!problem) {
    return null;
  }

  const existing = await prisma.dSAProgress.findUnique({
    where: { userId_problemId: { userId, problemId } },
  });

  const status: DSASolveStatus | undefined = input.status;
  const shouldIncrement = input.incrementAttempts === true;

  if (!existing) {
    return prisma.dSAProgress.create({
      data: {
        userId,
        problemId,
        status: status ?? 'UNSOLVED',
        attempts: shouldIncrement ? 1 : 0,
        ...(status === 'SOLVED' ? { lastSolvedAt: new Date() } : {}),
      },
    });
  }

  return prisma.dSAProgress.update({
    where: { id: existing.id },
    data: {
      ...(status !== undefined
        ? {
            status,
            // The time a problem was solved is kept even if it is later
            // marked unsolved: "last solved" is history, not current state.
            ...(status === 'SOLVED' ? { lastSolvedAt: new Date() } : {}),
          }
        : {}),
      ...(shouldIncrement ? { attempts: { increment: 1 } } : {}),
    },
  });
};
