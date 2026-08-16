import type { Response } from 'express';
import { env } from '../config/env';
import { userRepository } from '../repositories/user.repository';
import { otpRepository } from '../repositories/otp.repository';
import { BadRequestError, ConflictError, UnauthorizedError, TooManyRequestsError } from '../utils/errors';
import { jwtService } from './jwt.service';
import { passwordService } from './password.service';
import { generateOtpCode, otpDeliveryService } from './otp.service';
import { setAuthCookie, clearAuthCookie } from '../middleware/authenticate';

const maxOtpRequests = 3;
const rateLimitWindowMinutes = 10;

function toPublicUser(user: {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: string;
  campus_id: string | null;
}) {
  return {
    id: user.id,
    phone: user.phone,
    email: user.email,
    name: user.name,
    role: user.role,
    campus_id: user.campus_id
  };
}

function issueToken(user: {
  id: string;
  phone: string | null;
  email: string | null;
  role: 'student' | 'ops' | 'admin' | 'delivery_agent';
  campus_id: string | null;
}) {
  return jwtService.sign({
    id: user.id,
    phone: user.phone,
    email: user.email,
    role: user.role,
    campus_id: user.campus_id
  });
}

export const authService = {
  async signup(
    input: { name: string; password: string; email?: string; phone?: string },
    res?: Response
  ) {
    const email = input.email?.trim().toLowerCase() || null;
    const phone = input.phone?.trim() || null;

    if (!email && !phone) {
      throw new BadRequestError('Email or phone is required');
    }

    if (email) {
      const existingEmail = await userRepository.findByEmail(email);
      if (existingEmail) {
        throw new ConflictError('An account with this email already exists');
      }
    }

    if (phone) {
      const existingPhone = await userRepository.findByPhone(phone);
      if (existingPhone) {
        throw new ConflictError('An account with this phone already exists');
      }
    }

    const password_hash = await passwordService.hash(input.password);
    const user = await userRepository.createStudent({
      name: input.name.trim(),
      password_hash,
      email,
      phone
    });

    const token = issueToken(user);
    if (res) {
      setAuthCookie(res, token);
    }

    return { token, user: toPublicUser(user) };
  },

  async login(identifier: string, password: string, res?: Response) {
    const user = await userRepository.findByEmailOrPhone(identifier);
    if (!user || !user.password_hash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const ok = await passwordService.compare(password, user.password_hash);
    if (!ok) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is inactive');
    }

    const token = issueToken(user);
    if (res) {
      setAuthCookie(res, token);
    }

    return { token, user: toPublicUser(user) };
  },

  logout(res: Response) {
    clearAuthCookie(res);
    return { message: 'Logged out' };
  },

  async identity(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('Invalid credentials');
    }
    return { user: toPublicUser(user) };
  },

  async requestOtp(phone: string) {
    const since = new Date(Date.now() - rateLimitWindowMinutes * 60 * 1000);
    const recentCount = await otpRepository.countRecentByPhone(phone, since);

    if (recentCount >= maxOtpRequests) {
      throw new TooManyRequestsError('Too many OTP requests. Please try again later.');
    }

    const otpCode = generateOtpCode(env.OTP_LENGTH);
    const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);
    await otpRepository.create(phone, otpCode, expiresAt);
    await otpDeliveryService.sendOtp(phone, otpCode);

    return { message: 'OTP sent successfully' };
  },

  async verifyOtp(phone: string, otpCode: string, res?: Response) {
    const otpRequest = await otpRepository.findLatestValid(phone, otpCode, new Date());

    if (!otpRequest) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }

    await otpRepository.markVerified(otpRequest.id);

    let user = await userRepository.findByPhone(phone);

    if (!user) {
      user = await userRepository.createStudentByPhone(phone);
    }

    const token = issueToken(user);
    if (res) {
      setAuthCookie(res, token);
    }

    return {
      token,
      user: toPublicUser(user)
    };
  }
};
