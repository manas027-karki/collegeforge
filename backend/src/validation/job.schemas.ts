/**
 * Request validation for the job board.
 *
 * These schemas are the server's own gate: client-side validation is a UX
 * affordance and is never trusted.
 */
import { z } from 'zod';

import { ExperienceLevel, JobType } from '../generated/prisma/client';

/**
 * The list of filters the job board accepts.
 *
 * Every field is optional, and the whole query is a plain object of strings
 * from the query string, so each one is coerced and bounded here rather than
 * being trusted.
 */
export const jobQuerySchema = z.object({
  /** Free text, matched against the title, the company name and the skills. */
  search: z
    .string()
    .trim()
    .max(200, 'The search term must contain at most 200 characters.')
    .optional(),

  location: z
    .string()
    .trim()
    .max(160, 'The location must contain at most 160 characters.')
    .optional(),

  type: z.enum(JobType).optional(),

  experience: z.enum(ExperienceLevel).optional(),

  /** A company name, matched partially. */
  company: z
    .string()
    .trim()
    .max(160, 'The company must contain at most 160 characters.')
    .optional(),

  sort: z.enum(['newest', 'deadline']).default('newest'),

  /** One-based page number. */
  page: z.coerce
    .number()
    .int('The page must be a whole number.')
    .min(1, 'The page must be 1 or greater.')
    .default(1),

  /** How many results per page. */
  pageSize: z.coerce
    .number()
    .int('The page size must be a whole number.')
    .min(1, 'The page size must be at least 1.')
    .max(100, 'The page size must be 100 or fewer.')
    .default(20),
});

export type JobQuery = z.infer<typeof jobQuerySchema>;
