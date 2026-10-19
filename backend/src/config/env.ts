import path from 'node:path';

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine((value) => value.startsWith('postgresql://') || value.startsWith('postgres://'), {
      message: 'DATABASE_URL must be a PostgreSQL connection string',
    }),
  // A comma-separated allow-list of browser origins. Wildcards are not
  // allowed: they are incompatible with cookie-based authentication, and the
  // `Origin` header has to be reflected exactly or the browser blocks the
  // response.
  FRONTEND_URL: z
    .string()
    .min(1, 'FRONTEND_URL is required')
    .refine(
      (value) =>
        value
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
          .every((entry) => {
            try {
              const url = new URL(entry);
              return url.protocol === 'http:' || url.protocol === 'https:';
            } catch {
              return false;
            }
          }),
      { message: 'FRONTEND_URL must be a comma-separated list of http(s) origins' },
    ),
  COOKIE_NAME: z.string().min(1).default('careerforge_session'),
  // `lax` covers same-site deployments (the usual api./app. subdomain split) and
  // local development, where the port difference does not make the request
  // cross-site. `none` is only needed for genuinely cross-site frontends and
  // requires HTTPS, which `isProduction` already enforces.
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  SESSION_DURATION_DAYS: z.coerce.number().int().min(1).max(365).default(7),
  // Longer lifetime for the "remember me" option on the login form.
  SESSION_DURATION_DAYS_REMEMBERED: z.coerce.number().int().min(1).max(365).default(30),
  // bcrypt cost factor: 12 is a sensible interactive-login balance. 4-15 is the
  // range bcrypt itself accepts.
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `  - ${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('\n');

  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  /**
   * Every origin the API accepts requests from.
   *
   * The browser sends the exact origin it is on, so `http://localhost:5173`
   * and `http://127.0.0.1:5173` are different origins and both have to be
   * listed. Reflecting only the first one is what makes a request look like
   * a network failure in the browser console.
   */
  frontendUrls: parsedEnv.data.FRONTEND_URL.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean),
  frontendUrl: parsedEnv.data.FRONTEND_URL.split(',')[0].trim(),
  cookieName: parsedEnv.data.COOKIE_NAME,
  cookieSameSite: parsedEnv.data.COOKIE_SAME_SITE,
  sessionDurationDays: parsedEnv.data.SESSION_DURATION_DAYS,
  sessionDurationDaysRemembered: parsedEnv.data.SESSION_DURATION_DAYS_REMEMBERED,
  bcryptRounds: parsedEnv.data.BCRYPT_ROUNDS,
  isProduction: parsedEnv.data.NODE_ENV === 'production',
} as const;

export type Env = typeof env;
