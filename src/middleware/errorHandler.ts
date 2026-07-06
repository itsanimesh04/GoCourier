import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { sendError } from '../utils/apiResponse';
import { ApiError } from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    return sendError(res, error.statusCode, error.code, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Request validation failed', error.flatten());
  }

  if (env.NODE_ENV !== 'test') {
    console.error(error);
  }

  return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Unexpected server error');
};
