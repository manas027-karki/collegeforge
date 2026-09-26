import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import { apiRouter } from './routes';

/**
 * Builds the Express application.
 *
 * No business logic and no listener here: `server.ts` owns the process-level
 * concerns (port, graceful shutdown) so the app stays testable.
 */
export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');

  if (env.isProduction) {
    // Required for correct req.ip / secure-cookie detection behind a proxy.
    app.set('trust proxy', 1);
  }

  app.use(helmet());

  app.use(
    cors({
      // Explicit allow-list: wildcard origins are incompatible with cookie auth.
      origin: env.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
