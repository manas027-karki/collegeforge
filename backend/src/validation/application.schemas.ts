/**
 * Request validation for the application endpoints.
 *
 * These schemas are the server's own gate: client-side validation is a UX
 * affordance and is never trusted.
 */
import { z } from 'zod';

import { ApplicationStatus } from '../generated/prisma/client';

/**
 * A calendar date in `YYYY-MM-DD` form.
 *
 * The API stores these as timestamps at UTC midnight, so the date the user
 * picked is the date that comes back. The conversion to a `Date` happens in
 * the service, which keeps this schema declarative.
 */
const dateOnly = z
  .string({ error: 'The date must be text.' })
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use the YYYY-MM-DD format.' })
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), {
    message: 'That date does not exist.',
  });

const optionalDate = dateOnly.nullable().optional();

export const createApplicationSchema = z
  .object({
    jobId: z
      .string({ error: 'Job is required.' })
      .trim()
      .uuid('The job id must be a valid identifier.'),
    status: z.enum(ApplicationStatus).default('SAVED'),
    appliedAt: optionalDate,
    deadline: optionalDate,
    notes: z
      .string({ error: 'Notes must be text.' })
      .trim()
      .max(5000, 'Notes must contain at most 5000 characters.')
      .nullable()
      .optional(),
  })
  .strict();

export const updateApplicationSchema = z
  .object({
    status: z.enum(ApplicationStatus).optional(),
    appliedAt: optionalDate,
    deadline: optionalDate,
    notes: z
      .string({ error: 'Notes must be text.' })
      .trim()
      .max(5000, 'Notes must contain at most 5000 characters.')
      .nullable()
      .optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: 'Provide at least one field to update.',
  });

export const updateApplicationStatusSchema = z
  .object({
    status: z.enum(ApplicationStatus),
  })
  .strict();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
