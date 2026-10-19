import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import { apiRouter } from './routes';
import { ApiError } from './utils/ApiError';

/**
 * Builds the Express application.
 *
 * No business logic and no listener here: `server.ts` owns the process-level
 * concerns (port, graceful shutdown) so the app stays testable.
 */
/**
 * True for a loopback origin, whatever port it uses.
 *
 * In development the API is only reachable from the developer's own machine,
 * so any local port is trusted. This matters because the Vite dev server
 * picks the next free port when 5173 is taken, and because
 * `http://localhost:5173` and `http://127.0.0.1:5173` are different origins
 * to a browser. Production keeps the strict allow-list.
 */
const isLoopbackOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    const isLoopbackHost =
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '::1' ||
      url.hostname === '[::1]';

    return isLoopbackHost && (url.protocol === 'http:' || url.protocol === 'https:');
  } catch {
    return false;
  }
};

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
      /**
       * Reflects the request's own origin, but only when it is on the
       * allow-list.
       *
       * Returning a fixed origin instead would make `http://127.0.0.1:5173`
       * fail against a backend configured for `http://localhost:5173`. The
       * browser hides the real cause: it reports a blocked response as a
       * network error, so the app looks like the API is down when it is
       * actually a CORS mismatch.
       */
      origin: (origin, callback) => {
        // No Origin header means a non-browser client (curl, a health check),
        // which CORS does not apply to.
        if (!origin) {
          callback(null, true);
          return;
        }

        if (env.frontendUrls.includes(origin)) {
          callback(null, true);
          return;
        }

        if (!env.isProduction && isLoopbackOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(
          ApiError.forbidden(
            `Origin "${origin}" is not allowed. Add it to FRONTEND_URL.`,
          ),
        );
      },
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
