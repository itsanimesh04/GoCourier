import type { RequestHandler } from 'express';
import type { UserRole } from '../types/auth';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export function authorizeRole(...allowedRoles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError());
    }

    return next();
  };
}
