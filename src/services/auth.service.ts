import { env } from '../config/env';
import { withTransaction } from '../db/transaction';
import { otpRepository } from '../repositories/otp.repository';
import { userRepository } from '../repositories/user.repository';
import { UnauthorizedError, TooManyRequestsError } from '../utils/errors';
import { jwtService } from './jwt.service';
import { generateOtpCode, otpDeliveryService } from './otp.service';

const maxOtpRequests = 3;
const rateLimitWindowMinutes = 10;

export const authService = {
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

  async verifyOtp(phone: string, otpCode: string) {
    return withTransaction(async (client) => {
      const otpRequest = await otpRepository.consumeLatestValidForUpdate(client, phone, otpCode, new Date());

      if (!otpRequest) {
        throw new UnauthorizedError('Invalid or expired OTP');
      }

      const user = await userRepository.findOrCreateStudentByPhone(client, phone);

      const token = jwtService.sign({
        id: user.id,
        role: user.role,
        campus_id: user.campus_id
      });

      return {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          campus_id: user.campus_id
        }
      };
    });
  }
};
