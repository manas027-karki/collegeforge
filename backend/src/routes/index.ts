/**
 * Route table mounted at `/api`.
 *
 * Only `/health` is live. The remaining routers are registered so the URL
 * surface is explicit and returns 501 rather than 404, which keeps placeholder
 * endpoints distinguishable from typos.
 */
import { Router } from 'express';

import { applicationsRouter } from './applications.routes';
import { authRouter } from './auth.routes';
import { dsaRouter } from './dsa.routes';
import { healthRouter } from './health.routes';
import { jobsRouter } from './jobs.routes';
import { projectsRouter } from './projects.routes';
import { resumesRouter } from './resumes.routes';
import { studyRouter } from './study.routes';
import { usersRouter } from './users.routes';

export const apiRouter: Router = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/jobs', jobsRouter);
apiRouter.use('/applications', applicationsRouter);
apiRouter.use('/dsa', dsaRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/study', studyRouter);
apiRouter.use('/resumes', resumesRouter);
apiRouter.use('/users', usersRouter);
