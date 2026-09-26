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

  server.listen(env.port, () => {
    console.log(`CareerForge API running on http://localhost:${env.port}`);
    console.log(`  environment : ${env.nodeEnv}`);
    console.log(`  health      : http://localhost:${env.port}/api/health`);
    console.log(`  cors origin : ${env.frontendUrl}`);
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
