import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { JwtPayload } from '../types/auth';
import { UnauthorizedError } from '../utils/errors';

export const jwtService = {
  sign(payload: JwtPayload): string {
    const options: jwt.SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      subject: payload.id
    };

    return jwt.sign(payload, env.JWT_SECRET, options);
  },

  verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);

      if (
        typeof decoded !== 'object' ||
        typeof decoded.id !== 'string' ||
        typeof decoded.role !== 'string' ||
        !['student', 'ops', 'admin', 'delivery_agent'].includes(decoded.role) ||
        (decoded.campus_id !== null && typeof decoded.campus_id !== 'string')
      ) {
        throw new UnauthorizedError('Invalid token payload');
      }

      return {
        id: decoded.id,
        phone: typeof decoded.phone === 'string' ? decoded.phone : null,
        email: typeof decoded.email === 'string' ? decoded.email : null,
        role: decoded.role as JwtPayload['role'],
        campus_id: decoded.campus_id
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid token');
    }
  }
};
