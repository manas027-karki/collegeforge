/**
 * Project portfolio business logic.
 *
 * Every function takes the owning user's id and filters on it. That is the
 * tenant boundary: a project id from another account must not be readable,
 * writable, or deletable, and the filter lives here rather than being
 * repeated at each call site.
 */
import { prisma } from '../config/prisma';
import { Prisma, type Project } from '../generated/prisma/client';
import type { CreateProjectInput, UpdateProjectInput } from '../validation/project.schemas';

/**
 * Converts a `YYYY-MM-DD` date into a timestamp at UTC midnight.
 *
 * Storing UTC midnight means the date the user picked is the date that comes
 * back, no matter which timezone the browser is in.
 */
const toUtcDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

/** Lists every project belonging to a user, newest first. */
export const listProjects = async (userId: string): Promise<Project[]> =>
  prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

/** Reads one project, scoped to its owner. */
export const findProjectById = async (
  userId: string,
  projectId: string,
): Promise<Project | null> =>
  prisma.project.findFirst({
    where: { id: projectId, userId },
  });

/** Creates a project for a user. */
export const createProject = async (
  userId: string,
  input: CreateProjectInput,
): Promise<Project> =>
  prisma.project.create({
    data: {
      userId,
      name: input.name,
      description: input.description ?? null,
      technologies: input.technologies,
      status: input.status,
      githubUrl: input.githubUrl ?? null,
      liveUrl: input.liveUrl ?? null,
      startDate: input.startDate == null ? null : toUtcDate(input.startDate),
      endDate: input.endDate == null ? null : toUtcDate(input.endDate),
    },
  });

/**
 * Applies a partial update to one of the user's own projects.
 *
 * Returns `null` when the project does not exist or belongs to somebody
 * else. The two cases are deliberately indistinguishable: telling them apart
 * would confirm that a project id exists.
 *
 * As with the profile update, the write is assembled field by field so that
 * "field absent" and "field explicitly null" stay different things.
 */
export const updateProject = async (
  userId: string,
  projectId: string,
  input: UpdateProjectInput,
): Promise<Project | null> => {
  const data: Prisma.ProjectUpdateInput = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.technologies !== undefined) data.technologies = input.technologies;
  if (input.status !== undefined) data.status = input.status;
  if (input.githubUrl !== undefined) data.githubUrl = input.githubUrl;
  if (input.liveUrl !== undefined) data.liveUrl = input.liveUrl;
  if (input.startDate !== undefined) {
    data.startDate = input.startDate == null ? null : toUtcDate(input.startDate);
  }
  if (input.endDate !== undefined) {
    data.endDate = input.endDate == null ? null : toUtcDate(input.endDate);
  }

  // `updateMany` is used rather than `update` because it takes a plain
  // filter, which makes the owner check impossible to forget. `update` would
  // need a compound `where` to be equally safe.
  const { count } = await prisma.project.updateMany({
    where: { id: projectId, userId },
    data,
  });

  if (count === 0) {
    return null;
  }

  return prisma.project.findUnique({ where: { id: projectId } });
};

/**
 * Deletes one of the user's own projects.
 *
 * Returns `false` when there was nothing to delete, so the controller can
 * answer 404 for both "never existed" and "not yours".
 */
export const deleteProject = async (userId: string, projectId: string): Promise<boolean> => {
  const { count } = await prisma.project.deleteMany({
    where: { id: projectId, userId },
  });

  return count > 0;
};
