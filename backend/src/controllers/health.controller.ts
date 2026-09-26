import type { Request, Response } from 'express';

import { env } from '../config/env';
import { sendSuccess } from '../utils/httpResponse';

export const healthController = (_req: Request, res: Response): void => {
  sendSuccess(res, 'CareerForge API is running', {
    environment: env.nodeEnv,
    uptimeSeconds: Math.round(process.uptime()),
  });
};
