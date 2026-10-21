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
import type { ApiUser } from './user'

export { toUserProfile, type ApiUser } from './user'

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

export const authApi = {
  /** Creates an account and signs the new user in. */
  register: (input: RegisterInput) =>
    apiRequest<{ user: ApiUser }>({
      method: 'POST',
      url: '/api/auth/register',
      data: input,
    }),

  /** Verifies credentials and signs the user in. */
  login: (credentials: LoginCredentials) =>
    apiRequest<{ user: ApiUser }>({
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
  me: () => apiRequest<{ user: ApiUser }>({ method: 'GET', url: '/api/auth/me' }),
}
