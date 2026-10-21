/**
 * User profile endpoints, mounted at `/api/users`:
 *
 *   GET   /me   read the signed-in user's profile   -> 200
 *   PATCH /me   update the profile, partially       -> 200
 *
 * `requireAuth` is applied to the whole router: every route here is about the
 * signed-in user, and there is no endpoint for reading somebody else's
 * profile.
 */
import { Router } from 'express';

import { getProfileController, updateProfileController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/authMiddleware';

export const usersRouter: Router = Router();

usersRouter.use(requireAuth);

usersRouter.get('/me', getProfileController);
usersRouter.patch('/me', updateProfileController);
