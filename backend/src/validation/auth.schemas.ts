/**
 * Request validation for the authentication endpoints.
 *
 * These schemas are the server's own gate: client-side validation is a UX
 * affordance and is never trusted. Email is normalized to lowercase so that
 * `Demo@Example.com` and `demo@example.com` resolve to the same account, which
 * is what the unique index on `users.email` actually compares.
 */
import { z } from 'zod';

/**
 * bcrypt silently ignores input past 72 *bytes*. Rejecting longer passwords is
 * better than quietly hashing a prefix, which would make two different
 * passwords equivalent.
 */
const BCRYPT_MAX_PASSWORD_BYTES = 72;

const emailSchema = z
  .string({ error: 'Email is required.' })
  .trim()
  .toLowerCase()
  .pipe(z.email('Please enter a valid email address.'));

const passwordSchema = z
  .string({ error: 'Password is required.' })
  .min(8, 'Password must contain at least 8 characters.')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= BCRYPT_MAX_PASSWORD_BYTES, {
    message: `Password must contain at most ${BCRYPT_MAX_PASSWORD_BYTES} bytes.`,
  });

export const registerSchema = z
  .object({
    name: z
      .string({ error: 'Name is required.' })
      .trim()
      .min(2, 'Name must contain at least 2 characters.')
      // Matches the `VarChar(120)` column so a long name fails validation here
      // rather than as a database error.
      .max(120, 'Name must contain at most 120 characters.'),
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string({ error: 'Password is required.' }).min(1, 'Password is required.'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
