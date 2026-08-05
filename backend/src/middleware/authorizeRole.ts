import type { RequestHandler } from 'express';
import type { UserRole } from '../types/auth';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export function authorizeRole(...allowedRoles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
}

// Convenience middleware for specific roles
export const requireStudent = authorizeRole('student');
export const requireOps = authorizeRole('ops', 'admin');
export const requireAdmin = authorizeRole('admin');
export const requireDeliveryAgent = authorizeRole('delivery_agent', 'admin');
export const requireOpsOrAdmin = authorizeRole('ops', 'admin');
export const requireDeliveryOrAdmin = authorizeRole('delivery_agent', 'admin');
