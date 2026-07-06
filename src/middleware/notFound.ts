import type { RequestHandler } from 'express';
import { sendError } from '../utils/apiResponse';

export const notFound: RequestHandler = (_req, res) => {
  return sendError(res, 404, 'NOT_FOUND', 'Route not found');
};
