import type { RequestHandler } from 'express';
import { jwtService } from '../services/jwt.service';
import { UnauthorizedError } from '../utils/errors';

const COOKIE_NAME = 'auth_token';

export const setAuthCookie = (res: import('express').Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
};

export const clearAuthCookie = (res: import('express').Response): void => {
  res.clearCookie(COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
};

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    // Try cookie first, then Authorization header
    let token = req.cookies?.[COOKIE_NAME];
    
    if (!token) {
      const authorization = req.header('authorization');
      if (authorization?.startsWith('Bearer ')) {
        token = authorization.slice('Bearer '.length).trim();
      }
    }

    if (!token) {
      throw new UnauthorizedError();
    }

    const payload = jwtService.verify(token);
    
    req.user = {
      id: payload.id,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      role: payload.role,
      campus_id: payload.campus_id
    };

    next();
  } catch (error) {
    next(error instanceof UnauthorizedError ? error : new UnauthorizedError('Invalid token'));
  }
};