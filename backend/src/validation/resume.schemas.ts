/**
 * Request validation for the resume endpoints.
 *
 * These schemas are the server's own gate: client-side validation is a UX
 * affordance and is never trusted.
 */
import { z } from 'zod';

import { ResumeFileType } from '../generated/prisma/client';

/**
 * The largest file the app accepts, in bytes.
 *
 * Matches the client-side limit in `src/components/resume/resumeMeta.ts`. The
 * server enforces it independently, because the client limit is only a
 * convenience.
 */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * The file name.
 *
 * Only the name is stored, never a path. A path would let a client write
 * something like `../../etc/passwd` and have it rendered back later.
 */
const fileName = z
  .string({ error: 'A file name is required.' })
  .trim()
  .min(1, 'A file name is required.')
  // Matches the `VarChar(255)` column.
  .max(255, 'The file name must contain at most 255 characters.')
  .refine((value) => !value.includes('/') && !value.includes('\\'), {
    message: 'The file name cannot contain a path.',
  });

export const createResumeSchema = z
  .object({
    fileName,
    targetRole: z
      .string({ error: 'A target role is required.' })
      .trim()
      .min(1, 'A target role is required.')
      // Matches the `VarChar(160)` column.
      .max(160, 'The target role must contain at most 160 characters.'),
    fileType: z.enum(ResumeFileType),
    fileSize: z
      .number({ error: 'The file size must be a number of bytes.' })
      .int('The file size must be a whole number of bytes.')
      .min(1, 'The file size must be at least 1 byte.')
      .max(MAX_FILE_SIZE_BYTES, 'The file must be 5 MB or smaller.')
      .nullable()
      .optional(),
  })
  .strict();

/**
 * A partial update.
 *
 * The status can only be set to `ARCHIVED` here. Making a resume the current
 * one is a separate endpoint, because it also archives the others, and that
 * side effect does not belong in a field update.
 *
 * `fileUrl` is not accepted at all. The server owns it, and there is no
 * object storage yet, so a client has nothing legitimate to say about it.
 */
export const updateResumeSchema = z
  .object({
    fileName: fileName.optional(),
    targetRole: z
      .string({ error: 'A target role is required.' })
      .trim()
      .min(1, 'A target role is required.')
      .max(160, 'The target role must contain at most 160 characters.')
      .optional(),
    status: z.literal('ARCHIVED').optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: 'Provide at least one field to update.',
  });

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
