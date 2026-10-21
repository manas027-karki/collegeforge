/**
 * User profile HTTP layer.
 *
 * Responsibilities stop at request parsing, status codes, and the response
 * envelope: the profile rules live in `services/user.service.ts`.
 *
 * Handlers are `async` and rely on Express 5 forwarding rejected promises to
 * `errorHandler`, so a thrown `ApiError` becomes the standard
 * `{ success: false, message }` body.
 */
import type { Request, Response } from 'express';

import { findSafeUserById, updateProfile } from '../services/user.service';
import { currentUser } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/httpResponse';
import { ApiError } from '../utils/ApiError';
import { updateProfileSchema } from '../validation/user.schemas';

/**
 * GET /api/users/me
 *
 * Returns the signed-in user's profile. Behind `requireAuth`, so the session
 * has already been verified by the time this runs.
 */
export const getProfileController = async (req: Request, res: Response): Promise<void> => {
  const user = await findSafeUserById(currentUser(req).id);

  if (!user) {
    // The session points at a user that no longer exists. This should not
    // happen, but returning a 404 is better than a profile of `undefined`.
    throw ApiError.notFound('This account no longer exists.');
  }

  sendSuccess(res, 'Profile loaded.', { user });
};

/**
 * PATCH /api/users/me
 *
 * Applies a partial update and returns the stored profile, so the client can
 * replace its state with the authoritative values rather than assuming its
 * own input was written as sent.
 */
export const updateProfileController = async (req: Request, res: Response): Promise<void> => {
  const input = updateProfileSchema.parse(req.body);
  const user = await updateProfile(currentUser(req).id, input);

  sendSuccess(res, 'Profile updated.', { user });
};
