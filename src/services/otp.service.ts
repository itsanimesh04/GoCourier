import { randomInt } from 'node:crypto';
import { env } from '../config/env';

export function generateOtpCode(length: number): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length;
  return String(randomInt(min, max));
}

export const otpDeliveryService = {
  async sendOtp(phone: string, otpCode: string): Promise<void> {
    if (env.NODE_ENV !== 'production') {
      console.log(`[dev otp] phone=${phone} code=${otpCode}`);
      return;
    }

    throw new Error('Production SMS provider is not configured');
  }
};
