/**
 * Request validation for the user profile endpoints.
 *
 * These schemas are the server's own gate: client-side validation is a UX
 * affordance and is never trusted.
 *
 * Every field is optional so a client can send a partial update, and the
 * nullable ones accept `null` to clear the column. The difference between
 * "absent" and "null" is what lets the service decide whether to change a
 * value or leave it alone.
 */
import { z } from 'zod';

/**
 * A nullable text field.
 *
 * An empty string is normalized to `null` so that clearing a field in the UI
 * does not store a blank string in the database.
 */
const nullableText = (max: number, label: string) =>
  z
    .string({ error: `${label} must be text.` })
    .trim()
    .max(max, `${label} must contain at most ${max} characters.`)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional();

export const updateProfileSchema = z
  .object({
    name: z
      .string({ error: 'Name is required.' })
      .trim()
      .min(2, 'Name must contain at least 2 characters.')
      // Matches the `VarChar(120)` column so a long name fails validation here
      // rather than as a database error.
      .max(120, 'Name must contain at most 120 characters.')
      .optional(),
    phone: nullableText(32, 'Phone'),
    college: nullableText(160, 'College'),
    degree: nullableText(120, 'Degree'),
    graduationYear: z
      .number({ error: 'Graduation year must be a number.' })
      .int('Graduation year must be a whole number.')
      .min(1950, 'Graduation year must be 1950 or later.')
      .max(2100, 'Graduation year must be 2100 or earlier.')
      .nullable()
      .optional(),
    bio: nullableText(2000, 'Bio'),
  })
  .strict()
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: 'Provide at least one field to update.',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
