import { PrismaPg } from '@prisma/adapter-pg';

import { env } from './env';
import { PrismaClient } from '../generated/prisma/client';

const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.databaseUrl }),
    log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}
