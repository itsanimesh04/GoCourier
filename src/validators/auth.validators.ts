import { z } from 'zod';

const phone = z.string().trim().regex(/^\d{10,15}$/, 'Phone must contain 10 to 15 digits');
const otpCode = z.string().trim().regex(/^\d{4,8}$/, 'OTP code must contain 4 to 8 digits');

export const requestOtpSchema = z.object({
  body: z
    .object({
      phone
    })
    .strict()
});

export const verifyOtpSchema = z.object({
  body: z
    .object({
      phone,
      otp_code: otpCode
    })
    .strict()
});
