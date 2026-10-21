/**
 * Request validation for the project endpoints.
 *
 * These schemas are the server's own gate: client-side validation is a UX
 * affordance and is never trusted.
 */
import { z } from 'zod';

import { ProjectStatus } from '../generated/prisma/client';

/**
 * A URL that is either absent or a valid absolute http(s) URL.
 *
 * An empty string is treated as "no link", because that is what a text input
 * produces when the user clears it.
 */
const optionalUrl = z
  .string({ error: 'The link must be text.' })
  .trim()
  .max(2048, 'The link must contain at most 2048 characters.')
  .refine(
    (value) => {
      if (value.length === 0) return true;

      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Enter a valid link starting with http:// or https://.' },
  )
  .nullable()
  .optional();

/**
 * A calendar date in `YYYY-MM-DD` form.
 *
 * The API stores these as timestamps at UTC midnight, so the date the user
 * picked is the date that comes back. The conversion to a `Date` happens in
 * the service, which keeps this schema declarative.
 */
const optionalDate = z
  .string({ error: 'The date must be text.' })
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use the YYYY-MM-DD format.' })
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), {
    message: 'That date does not exist.',
  })
  .nullable()
  .optional();

/**
 * The list of technologies a project was built with.
 *
 * No default here: the default belongs to the create schema only. A schema
 * with a default fills the field in when it is absent, which on a partial
 * update would silently wipe the stored value.
 */
const technologyList = z.array(
  z
    .string({ error: 'Each technology must be text.' })
    .trim()
    .min(1, 'A technology cannot be empty.')
    .max(60, 'A technology must contain at most 60 characters.'),
).max(20, 'A project can list at most 20 technologies.');

export const createProjectSchema = z
  .object({
    name: z
      .string({ error: 'Name is required.' })
      .trim()
      .min(1, 'Name is required.')
      // Matches the `VarChar(160)` column.
      .max(160, 'Name must contain at most 160 characters.'),
    description: z
      .string({ error: 'Description must be text.' })
      .trim()
      .max(5000, 'Description must contain at most 5000 characters.')
      .nullable()
      .optional(),
    technologies: technologyList.default([]),
    status: z.enum(ProjectStatus).default('PLANNED'),
    githubUrl: optionalUrl,
    liveUrl: optionalUrl,
    startDate: optionalDate,
    endDate: optionalDate,
  })
  .strict();

/**
 * A partial update.
 *
 * Every field is optional so a client can send only what changed. `null`
 * clears a field; omitting it leaves it alone.
 */
export const updateProjectSchema = z
  .object({
    name: z
      .string({ error: 'Name is required.' })
      .trim()
      .min(1, 'Name is required.')
      .max(160, 'Name must contain at most 160 characters.')
      .optional(),
    description: z
      .string({ error: 'Description must be text.' })
      .trim()
      .max(5000, 'Description must contain at most 5000 characters.')
      .nullable()
      .optional(),
    technologies: technologyList.optional(),
    status: z.enum(ProjectStatus).optional(),
    githubUrl: optionalUrl,
    liveUrl: optionalUrl,
    startDate: optionalDate,
    endDate: optionalDate,
  })
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: 'Provide at least one field to update.',
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
