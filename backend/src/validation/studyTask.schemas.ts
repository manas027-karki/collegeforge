/**
 * Request validation for the study task endpoints.
 *
 * These schemas are the server's own gate: client-side validation is a UX
 * affordance and is never trusted.
 */
import { z } from 'zod';

import { TaskPriority, TaskStatus } from '../generated/prisma/client';

/**
 * A calendar date in `YYYY-MM-DD` form.
 *
 * The API stores these as timestamps at UTC midnight, so the date the user
 * picked is the date that comes back. The conversion to a `Date` happens in
 * the service, which keeps this schema declarative.
 */
const dateOnly = z
  .string({ error: 'A due date is required.' })
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use the YYYY-MM-DD format.' })
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), {
    message: 'That date does not exist.',
  });

export const createStudyTaskSchema = z
  .object({
    title: z
      .string({ error: 'Title is required.' })
      .trim()
      .min(1, 'Title is required.')
      // Matches the `VarChar(200)` column.
      .max(200, 'Title must contain at most 200 characters.'),
    description: z
      .string({ error: 'Description must be text.' })
      .trim()
      .max(5000, 'Description must contain at most 5000 characters.')
      .nullable()
      .optional(),
    priority: z.enum(TaskPriority).default('MEDIUM'),
    status: z.enum(TaskStatus).default('TODO'),
    dueDate: dateOnly,
    category: z
      .string({ error: 'Category is required.' })
      .trim()
      .min(1, 'Category is required.')
      // Matches the `VarChar(120)` column.
      .max(120, 'Category must contain at most 120 characters.'),
    estimatedMinutes: z
      .number({ error: 'The estimate must be a number of minutes.' })
      .int('The estimate must be a whole number of minutes.')
      .min(1, 'The estimate must be at least 1 minute.')
      .max(1440, 'The estimate must be at most 1440 minutes.')
      .nullable()
      .optional(),
  })
  .strict();

/**
 * A partial update.
 *
 * Every field is optional so a client can send only what changed. `null`
 * clears a field; omitting it leaves the field alone.
 *
 * `dueDate` and `category` are required by the database, so they can be
 * changed but not cleared.
 */
export const updateStudyTaskSchema = z
  .object({
    title: z
      .string({ error: 'Title is required.' })
      .trim()
      .min(1, 'Title is required.')
      .max(200, 'Title must contain at most 200 characters.')
      .optional(),
    description: z
      .string({ error: 'Description must be text.' })
      .trim()
      .max(5000, 'Description must contain at most 5000 characters.')
      .nullable()
      .optional(),
    priority: z.enum(TaskPriority).optional(),
    status: z.enum(TaskStatus).optional(),
    dueDate: dateOnly.optional(),
    category: z
      .string({ error: 'Category is required.' })
      .trim()
      .min(1, 'Category is required.')
      .max(120, 'Category must contain at most 120 characters.')
      .optional(),
    estimatedMinutes: z
      .number({ error: 'The estimate must be a number of minutes.' })
      .int('The estimate must be a whole number of minutes.')
      .min(1, 'The estimate must be at least 1 minute.')
      .max(1440, 'The estimate must be at most 1440 minutes.')
      .nullable()
      .optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: 'Provide at least one field to update.',
  });

export type CreateStudyTaskInput = z.infer<typeof createStudyTaskSchema>;
export type UpdateStudyTaskInput = z.infer<typeof updateStudyTaskSchema>;
