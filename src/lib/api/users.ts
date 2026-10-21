/**
 * User profile endpoints, mirroring `backend/src/routes/users.routes.ts`.
 *
 *   GET   /api/users/me   read the signed-in user's profile -> 200
 *   PATCH /api/users/me   update the profile, partially     -> 200
 */
import { apiRequest } from './client'
import type { ApiUser } from './user'
import type { UserProfile } from '../../types'

export { toUserProfile, type ApiUser } from './user'

/**
 * The shape the API accepts for a profile update.
 *
 * `null` clears a field. Omitting a field leaves it alone, which is what
 * makes the endpoint a partial update.
 */
export interface UpdateProfilePayload {
  name?: string
  phone?: string | null
  college?: string | null
  degree?: string | null
  graduationYear?: number | null
  bio?: string | null
}

/**
 * Converts the app's profile shape into the API's update payload.
 *
 * The UI keeps the graduation year as a string because it is edited in a text
 * input, while the API stores it as a number. A blank field is sent as `null`
 * so it clears the column instead of storing an empty string.
 */
export const toUpdatePayload = (profile: Partial<UserProfile>): UpdateProfilePayload => {
  const payload: UpdateProfilePayload = {}

  if (profile.fullName !== undefined) payload.name = profile.fullName
  if (profile.phone !== undefined) payload.phone = profile.phone || null
  if (profile.college !== undefined) payload.college = profile.college || null
  if (profile.degree !== undefined) payload.degree = profile.degree || null
  if (profile.bio !== undefined) payload.bio = profile.bio || null

  if (profile.graduationYear !== undefined) {
    const year = Number(profile.graduationYear)
    payload.graduationYear = Number.isInteger(year) && year > 0 ? year : null
  }

  return payload
}

export const usersApi = {
  /** Reads the signed-in user's profile. */
  getProfile: () => apiRequest<{ user: ApiUser }>({ method: 'GET', url: '/api/users/me' }),

  /**
   * Applies a partial profile update.
   *
   * The response carries the stored profile, so the client can replace its
   * state with the authoritative values rather than assuming its own input was
   * written as sent.
   */
  updateProfile: (input: UpdateProfilePayload) =>
    apiRequest<{ user: ApiUser }>({
      method: 'PATCH',
      url: '/api/users/me',
      data: input,
    }),
}
