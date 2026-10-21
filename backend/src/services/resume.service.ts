/**
 * Resume business logic.
 *
 * A resume is metadata only. The file itself is never stored in PostgreSQL:
 * `fileUrl` points at object storage, which is not wired up yet, so it stays
 * null and the download button has nothing to point at.
 *
 * Two rules live here rather than in the client:
 *
 *   1. The version number is assigned by the server. The client used to count
 *      the resumes it had, which two devices would not agree on.
 *   2. A user has at most one current resume. The database enforces it with a
 *      partial unique index, and these functions keep it true.
 */
import { prisma } from '../config/prisma';
import { Prisma, type Resume } from '../generated/prisma/client';
import type { CreateResumeInput, UpdateResumeInput } from '../validation/resume.schemas';

/** Lists the user's resumes, newest first. */
export const listResumes = async (userId: string): Promise<Resume[]> =>
  prisma.resume.findMany({
    where: { userId },
    orderBy: { version: 'desc' },
  });

/** Reads one of the user's resumes, scoped to its owner. */
export const findResumeById = async (
  userId: string,
  resumeId: string,
): Promise<Resume | null> =>
  prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

/**
 * Creates a resume and makes it the current one.
 *
 * The version is the next number for this user, and the previous current
 * resume is archived in the same transaction. The transaction matters: the
 * database has a partial unique index allowing only one current resume per
 * user, so archiving and inserting have to happen together or the insert
 * would fail.
 */
export const createResume = async (
  userId: string,
  input: CreateResumeInput,
): Promise<Resume> =>
  prisma.$transaction(async (tx) => {
    const highest = await tx.resume.findFirst({
      where: { userId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    // Archive the current resume first: the unique index allows only one.
    await tx.resume.updateMany({
      where: { userId, status: 'CURRENT' },
      data: { status: 'ARCHIVED' },
    });

    return tx.resume.create({
      data: {
        userId,
        fileName: input.fileName,
        targetRole: input.targetRole,
        fileType: input.fileType,
        fileSize: input.fileSize ?? null,
        // There is no object storage yet, so there is no URL to store.
        fileUrl: null,
        version: (highest?.version ?? 0) + 1,
        status: 'CURRENT',
      },
    });
  });

/**
 * Applies a partial update to one of the user's own resumes.
 *
 * Returns `null` when the resume does not exist or belongs to somebody else.
 * The two cases are deliberately indistinguishable.
 */
export const updateResume = async (
  userId: string,
  resumeId: string,
  input: UpdateResumeInput,
): Promise<Resume | null> => {
  const data: Prisma.ResumeUpdateInput = {};

  if (input.fileName !== undefined) data.fileName = input.fileName;
  if (input.targetRole !== undefined) data.targetRole = input.targetRole;
  if (input.status !== undefined) data.status = input.status;

  // `updateMany` is used rather than `update` because it takes a plain
  // filter, which makes the owner check impossible to forget.
  const { count } = await prisma.resume.updateMany({
    where: { id: resumeId, userId },
    data,
  });

  if (count === 0) {
    return null;
  }

  return prisma.resume.findUnique({ where: { id: resumeId } });
};

/**
 * Makes one of the user's resumes the current one and archives the others.
 *
 * The archive and the promotion happen in one transaction for the same reason
 * as in `createResume`: the partial unique index allows only one current
 * resume per user, and the two writes have to be ordered or the promotion
 * would fail.
 */
export const setCurrentResume = async (
  userId: string,
  resumeId: string,
): Promise<Resume | null> =>
  prisma.$transaction(async (tx) => {
    const existing = await tx.resume.findFirst({
      where: { id: resumeId, userId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    await tx.resume.updateMany({
      where: { userId, status: 'CURRENT', id: { not: resumeId } },
      data: { status: 'ARCHIVED' },
    });

    await tx.resume.update({
      where: { id: resumeId },
      data: { status: 'CURRENT' },
    });

    return tx.resume.findUnique({ where: { id: resumeId } });
  });

/** Deletes one of the user's own resumes. */
export const deleteResume = async (userId: string, resumeId: string): Promise<boolean> => {
  const { count } = await prisma.resume.deleteMany({
    where: { id: resumeId, userId },
  });

  return count > 0;
};
