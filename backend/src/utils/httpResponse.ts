/**
 * Response helpers for the single API envelope used by every endpoint:
 *
 *   success -> { success: true,  message: string, ...fields }
 *   failure -> { success: false, message: string, code?, details?, stack? }
 *
 * `message` always lives at the top level so clients can display it without
 * knowing the internal error taxonomy. `details` and `stack` are stripped in
 * production by the error handler, never here.
 */
import type { Response } from 'express';

export interface ApiSuccessBody {
  success: true;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
}

export type ApiSuccessResponse<TFields> = ApiSuccessBody & TFields;

/**
 * Sends `{ success: true, message, ...fields }`.
 *
 * `fields` is spread at the top level so simple endpoints can return their own
 * keys directly; resource endpoints pass `{ data }`.
 */
export const sendSuccess = <TFields extends object>(
  res: Response,
  message: string,
  fields?: TFields,
  status = 200,
): void => {
  const body = {
    success: true,
    message,
    ...fields,
  } as ApiSuccessResponse<TFields>;

  res.status(status).json(body);
};

export const sendError = (
  res: Response,
  status: number,
  message: string,
  code?: string,
  details?: unknown,
  stack?: string,
): void => {
  const body: ApiErrorBody = { success: false, message };

  if (code !== undefined) {
    body.code = code;
  }
  if (details !== undefined) {
    body.details = details;
  }
  if (stack !== undefined) {
    body.stack = stack;
  }

  res.status(status).json(body);
};
