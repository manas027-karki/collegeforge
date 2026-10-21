import { createServer } from 'node:http';

import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

/**
 * Process entry point: validates configuration (via `config/env`), opens the
 * HTTP listener, and handles graceful shutdown. No request logic lives here.
 */
const start = (): void => {
  const server = createServer(createApp());

  /**
   * Turns a listener failure into one actionable line.
   *
   * Without this, starting a second instance of the API produces an unhandled
   * `error` event and a stack trace, which reads like a crash rather than the
   * ordinary "you already have one running" situation.
   */
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${env.port} is already in use. Stop the other process, or set a different PORT in backend/.env.`,
      );
      process.exit(1);
    }

    console.error('Failed to start the API:', error);
    process.exit(1);
  });

  server.listen(env.port, () => {
    console.log(`CareerForge API running on http://localhost:${env.port}`);
    console.log(`  environment : ${env.nodeEnv}`);
    console.log(`  health      : http://localhost:${env.port}/api/health`);
    console.log(`  cors origin : ${env.frontendUrls.join(', ')}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`\n${signal} received, shutting down.`);

    server.close(() => {
      void prisma.$disconnect().finally(() => {
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
};

start();
