import type { RequestHandler } from 'express';
import { jwtService } from '../services/jwt.service';
import { userRepository } from '../repositories/user.repository';
import { UnauthorizedError } from '../utils/errors';

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.header('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedError();
    }

    const payload = jwtService.verify(token);
    const user = await userRepository.findById(payload.id);

    if (!user || !user.is_active) {
      throw new UnauthorizedError('Invalid or inactive user');
    }

    req.user = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      campus_id: user.campus_id
    };

    next();
  } catch (error) {
    next(error instanceof UnauthorizedError ? error : new UnauthorizedError('Invalid token'));
  }
};
