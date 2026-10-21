/**
 * Request validation for the DSA tracker endpoints.
 *
 * These schemas are the server's own gate: client-side validation is a UX
 * affordance and is never trusted.
 */
import { z } from 'zod';

import {
  DSADifficulty,
  DSAPlatform,
  DSASolveStatus,
} from '../generated/prisma/client';

/**
 * A link to the problem.
 *
 * Only http(s) is allowed, so a stored link can never be a `javascript:` URL
 * that a renderer would follow.
 */
const problemUrl = z
  .string({ error: 'A problem link is required.' })
  .trim()
  .max(2048, 'The link must contain at most 2048 characters.')
  .refine(
    (value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Enter a valid link starting with http:// or https://.' },
  );

export const createProblemSchema = z
  .object({
    title: z
      .string({ error: 'Title is required.' })
      .trim()
      .min(1, 'Title is required.')
      // Matches the `VarChar(200)` column.
      .max(200, 'Title must contain at most 200 characters.'),
    difficulty: z.enum(DSADifficulty).default('EASY'),
    topic: z
      .string({ error: 'Topic is required.' })
      .trim()
      .min(1, 'Topic is required.')
      // Matches the `VarChar(120)` column.
      .max(120, 'Topic must contain at most 120 characters.'),
    platform: z.enum(DSAPlatform).default('LEETCODE'),
    url: problemUrl,
  })
  .strict();

/**
 * A partial update.
 *
 * Every field is optional so a client can send only what changed.
 */
export const updateProblemSchema = z
  .object({
    title: z
      .string({ error: 'Title is required.' })
      .trim()
      .min(1, 'Title is required.')
      .max(200, 'Title must contain at most 200 characters.')
      .optional(),
    difficulty: z.enum(DSADifficulty).optional(),
    topic: z
      .string({ error: 'Topic is required.' })
      .trim()
      .min(1, 'Topic is required.')
      .max(120, 'Topic must contain at most 120 characters.')
      .optional(),
    platform: z.enum(DSAPlatform).optional(),
    url: problemUrl.optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: 'Provide at least one field to update.',
  });

/**
 * An update to the signed-in user's progress on a problem.
 *
 * The status is a *set* operation: the client knows whether it is marking a
 * problem solved or unsolved, so it can say which. The attempt count is an
 * *increment*, and the server owns that counter — otherwise two devices
 * recording an attempt at the same time would lose one of them.
 */
export const updateProgressSchema = z
  .object({
    status: z.enum(DSASolveStatus).optional(),
    incrementAttempts: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) => value.status !== undefined || value.incrementAttempts !== undefined,
    { message: 'Provide a status or record an attempt.' },
  );

export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
