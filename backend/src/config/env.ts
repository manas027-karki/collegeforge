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
  FRONTEND_URL: z.url('FRONTEND_URL must be a valid URL'),
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
  frontendUrl: parsedEnv.data.FRONTEND_URL,
  cookieName: parsedEnv.data.COOKIE_NAME,
  cookieSameSite: parsedEnv.data.COOKIE_SAME_SITE,
  sessionDurationDays: parsedEnv.data.SESSION_DURATION_DAYS,
  sessionDurationDaysRemembered: parsedEnv.data.SESSION_DURATION_DAYS_REMEMBERED,
  bcryptRounds: parsedEnv.data.BCRYPT_ROUNDS,
  isProduction: parsedEnv.data.NODE_ENV === 'production',
} as const;

export type Env = typeof env;
