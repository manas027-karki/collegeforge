/**
 * User profile reads and updates.
 *
 * The `SafeUser` shape and the allow-list projection that produces it live
 * here rather than in the auth service. Reading a user without credentials is
 * a profile concern, and the auth service is only one of its callers — so the
 * dependency points from auth to user, not the other way around.
 *
 * Two invariants are enforced in this module rather than at the edges:
 *   1. `passwordHash` is never part of a returned value. The Prisma `select`
 *      keeps it out of memory, and every caller returns a `SafeUser`.
 *   2. Updates are always scoped to a single user id. There is no code path
 *      that can write to another account's profile.
 */
import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';
import type { UpdateProfileInput } from '../validation/user.schemas';

/**
 * The only user shape allowed to leave the service.
 *
 * Deliberately omits `passwordHash` and any session material. `createdAt` is a
 * `Date` here and becomes an ISO-8601 string once JSON-encoded.
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  degree: string | null;
  graduationYear: number | null;
  bio: string | null;
  createdAt: Date;
}

/**
 * Prisma projection used for every user read.
 *
 * This allow-list is the actual security boundary: `passwordHash` is not
 * selected, so it cannot be read into memory, spread into a response, or
 * attached to `req.user` by accident.
 */
export const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  college: true,
  degree: true,
  graduationYear: true,
  bio: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

/** The row shape produced by `SAFE_USER_SELECT`. */
export type SelectedUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  degree: string | null;
  graduationYear: number | null;
  bio: string | null;
  createdAt: Date;
};

/**
 * Normalizes a selected user into the response DTO.
 *
 * Callers may pass a projection that includes `passwordHash`; returning a
 * fresh object built from named fields means the hash cannot be spread into a
 * response by accident.
 */
export const toSafeUser = (user: SelectedUser & { passwordHash?: string }): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  college: user.college,
  degree: user.degree,
  graduationYear: user.graduationYear,
  bio: user.bio,
  createdAt: user.createdAt,
});

/** Reads a user by id, without credentials. */
export const findSafeUserById = async (id: string): Promise<SafeUser | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: SAFE_USER_SELECT,
  });

  return user ? toSafeUser(user) : null;
};

/**
 * Applies a partial profile update to one user.
 *
 * The distinction between "field absent" and "field explicitly null" is what
 * makes partial updates safe: an absent field is left untouched, while an
 * explicit `null` clears the column. A blanket spread of the input would lose
 * that distinction, so the update is assembled field by field.
 */
export const updateProfile = async (
  userId: string,
  updates: UpdateProfileInput,
): Promise<SafeUser> => {
  const data: Prisma.UserUpdateInput = {};

  if (updates.name !== undefined) data.name = updates.name;
  if (updates.phone !== undefined) data.phone = updates.phone;
  if (updates.college !== undefined) data.college = updates.college;
  if (updates.degree !== undefined) data.degree = updates.degree;
  if (updates.graduationYear !== undefined) data.graduationYear = updates.graduationYear;
  if (updates.bio !== undefined) data.bio = updates.bio;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: SAFE_USER_SELECT,
  });

  return toSafeUser(user);
};
