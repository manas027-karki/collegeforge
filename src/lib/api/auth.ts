/**
 * Authentication endpoints, mirroring `backend/src/routes/auth.routes.ts`.
 *
 *   POST /api/auth/register  create an account and sign in -> 201
 *   POST /api/auth/login     verify credentials and sign in -> 200
 *   POST /api/auth/logout    invalidate the session         -> 200
 *   GET  /api/auth/me        current user for the cookie    -> 200
 *
 * The response body never contains a session token: it travels only in the
 * `httpOnly` cookie, which the browser attaches to these calls automatically.
 */
import { apiRequest } from './client'
import type { UserProfile } from '../../types'

/**
 * The user shape the API returns.
 *
 * Mirrors the backend's `SafeUser`: identity and profile only, with no
 * password hash and no session material.
 */
export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string | null
  college: string | null
  degree: string | null
  graduationYear: number | null
  bio: string | null
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  /**
   * Requests a longer-lived session.
   *
   * The server owns the durations, so this is a hint rather than a number the
   * client gets to pick.
   */
  rememberMe?: boolean
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

/**
 * Converts the API's user into the app's profile shape.
 *
 * The two models differ on purpose: the API stores a year as a number and
 * calls the field `name`, while the UI models a year as an optional string
 * and calls it `fullName`. Keeping the conversion here means the rest of the
 * app never has to think about it.
 */
export const toUserProfile = (user: AuthUser): UserProfile => ({
  fullName: user.name,
  email: user.email,
  phone: user.phone ?? undefined,
  college: user.college ?? undefined,
  degree: user.degree ?? undefined,
  graduationYear: user.graduationYear != null ? String(user.graduationYear) : undefined,
  bio: user.bio ?? undefined,
})

export const authApi = {
  /** Creates an account and signs the new user in. */
  register: (input: RegisterInput) =>
    apiRequest<{ user: AuthUser }>({
      method: 'POST',
      url: '/api/auth/register',
      data: input,
    }),

  /** Verifies credentials and signs the user in. */
  login: (credentials: LoginCredentials) =>
    apiRequest<{ user: AuthUser }>({
      method: 'POST',
      url: '/api/auth/login',
      data: credentials,
    }),

  /**
   * Invalidates the session.
   *
   * The API answers 200 even when the cookie was already missing or expired,
   * because logging out is a client-side state reset rather than a failure.
   */
  logout: () => apiRequest<Record<string, never>>({ method: 'POST', url: '/api/auth/logout' }),

  /**
   * Returns the user behind the session cookie.
   *
   * Rejects with a 401 `ApiRequestError` when there is no live session, which
   * is how the app decides whether a visitor is signed in.
   */
  me: () => apiRequest<{ user: AuthUser }>({ method: 'GET', url: '/api/auth/me' }),
}
