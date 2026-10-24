/**
 * Application pipeline business logic.
 *
 * Every function takes the owning user's id and filters on it. That is the
 * tenant boundary: an application id from another account must not be readable,
 * writable, or deletable, and the filter lives here rather than being
 * repeated at each call site.
 */
import { prisma } from '../config/prisma';
import { Prisma, type ApplicationStatus } from '../generated/prisma/client';
import type {
  CreateApplicationInput,
  UpdateApplicationInput,
  UpdateApplicationStatusInput,
} from '../validation/application.schemas';
import { ApiError } from '../utils/ApiError';

const ACTIVE_STATUSES_BEFORE_APPLIED = new Set<ApplicationStatus>(['SAVED']);

/**
 * Converts a `YYYY-MM-DD` date into a timestamp at UTC midnight.
 *
 * Storing UTC midnight means the date the user picked is the date that comes
 * back, no matter which timezone the browser is in.
 */
const toUtcDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

/**
 * An application with its job and company expanded.
 *
 * The frontend type denormalizes company, role, and location as plain strings,
 * so the API response should stay relational and let the client flatten it.
 */
export interface ApplicationWithJob {
  id: string;
  userId: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt: Date | null;
  deadline: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: string;
    title: string;
    location: string;
    company: {
      id: string;
      name: string;
    };
  };
}

/** Lists every application belonging to a user, newest first. */
export const listApplications = async (userId: string): Promise<ApplicationWithJob[]> =>
  prisma.application.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  }) as Promise<ApplicationWithJob[]>;

/** Reads one application, scoped to its owner. */
export const findApplicationById = async (
  userId: string,
  applicationId: string,
): Promise<ApplicationWithJob | null> =>
  prisma.application.findFirst({
    where: { id: applicationId, userId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          location: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  }) as Promise<ApplicationWithJob | null>;

/** Creates an application for a user. */
export const createApplication = async (
  userId: string,
  input: CreateApplicationInput,
): Promise<ApplicationWithJob> => {
  // Verify the job exists (jobs are reference data)
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });
  if (!job) {
    throw ApiError.notFound('Job not found.');
  }

  // Determine appliedAt based on status transition rules
  let appliedAt: Date | null = null;
  if (input.appliedAt !== undefined && input.appliedAt !== null) {
    appliedAt = toUtcDate(input.appliedAt);
  } else if (input.status && input.status !== 'SAVED') {
    appliedAt = new Date();
  }

  try {
    const application = await prisma.application.create({
      data: {
        userId,
        jobId: input.jobId,
        status: input.status ?? 'SAVED',
        appliedAt,
        deadline: input.deadline == null ? null : toUtcDate(input.deadline),
        notes: input.notes ?? null,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return application as ApplicationWithJob;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw ApiError.conflict('You have already applied to this job.');
    }
    throw error;
  }
};

/**
 * Applies a partial update to one of the user's own applications.
 *
 * Returns `null` when the application does not exist or belongs to somebody
 * else. The two cases are deliberately indistinguishable: telling them apart
 * would confirm that an application id exists.
 *
 * As with other updates, the write is assembled field by field so that
 * "field absent" and "field explicitly null" stay different things.
 */
export const updateApplication = async (
  userId: string,
  applicationId: string,
  input: UpdateApplicationInput,
): Promise<ApplicationWithJob | null> => {
  const existing = await findApplicationById(userId, applicationId);
  if (!existing) {
    return null;
  }

  const data: Prisma.ApplicationUpdateInput = {};

  if (input.status !== undefined) {
    data.status = input.status;
    // Set appliedAt when status first leaves SAVED
    if (ACTIVE_STATUSES_BEFORE_APPLIED.has(existing.status) && !existing.appliedAt) {
      data.appliedAt = new Date();
    }
  }

  if (input.appliedAt !== undefined) {
    data.appliedAt = input.appliedAt == null ? null : toUtcDate(input.appliedAt);
  }
  if (input.deadline !== undefined) {
    data.deadline = input.deadline == null ? null : toUtcDate(input.deadline);
  }
  if (input.notes !== undefined) {
    data.notes = input.notes;
  }

  // `updateMany` is used rather than `update` because it takes a plain
  // filter, which makes the owner check impossible to forget.
  const { count } = await prisma.application.updateMany({
    where: { id: applicationId, userId },
    data,
  });

  if (count === 0) {
    return null;
  }

  return findApplicationById(userId, applicationId);
};

/**
 * Updates just the status of an application.
 *
 * Convenience method that handles the appliedAt transition.
 */
export const updateApplicationStatus = async (
  userId: string,
  applicationId: string,
  input: UpdateApplicationStatusInput,
): Promise<ApplicationWithJob | null> => {
  return updateApplication(userId, applicationId, { status: input.status });
};

/**
 * Deletes one of the user's own applications.
 *
 * Returns `false` when there was nothing to delete, so the controller can
 * answer 404 for both "never existed" and "not yours".
 */
export const deleteApplication = async (userId: string, applicationId: string): Promise<boolean> => {
  const { count } = await prisma.application.deleteMany({
    where: { id: applicationId, userId },
  });

  return count > 0;
};
