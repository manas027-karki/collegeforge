/**
 * The shared user shape returned by the API.
 *
 * Both the auth endpoints and the profile endpoints return the same user, so
 * the type and the mapping live in one place rather than being duplicated per
 * resource.
 */
import type { UserProfile } from '../../types'

/**
 * A user as the API returns them.
 *
 * Mirrors the backend's `SafeUser`: identity and profile only, with no
 * password hash and no session material.
 */
export interface ApiUser {
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

/**
 * Converts the API's user into the app's profile shape.
 *
 * The two models differ on purpose: the API stores a year as a number and
 * calls the field `name`, while the UI models a year as an optional string
 * and calls it `fullName`. Keeping the conversion here means the rest of the
 * app never has to think about it.
 */
export const toUserProfile = (user: ApiUser): UserProfile => ({
  fullName: user.name,
  email: user.email,
  phone: user.phone ?? undefined,
  college: user.college ?? undefined,
  degree: user.degree ?? undefined,
  graduationYear: user.graduationYear != null ? String(user.graduationYear) : undefined,
  bio: user.bio ?? undefined,
})
