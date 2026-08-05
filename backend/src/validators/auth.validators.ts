import { z } from 'zod';

const phone = z.string().trim().regex(/^\d{10,15}$/, 'Phone must contain 10 to 15 digits');
const otpCode = z.string().trim().regex(/^\d{4,8}$/, 'OTP code must contain 4 to 8 digits');
const email = z.string().trim().email('Invalid email address').toLowerCase();
const password = z.string().min(6, 'Password must be at least 6 characters').max(128);

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

export const signupSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1, 'Name is required').max(120),
      password,
      email: email.optional(),
      phone: phone.optional()
    })
    .strict()
    .refine((data) => Boolean(data.email || data.phone), {
      message: 'Email or phone is required',
      path: ['email']
    })
});

export const loginSchema = z.object({
  body: z
    .object({
      identifier: z.string().trim().min(1, 'Email or phone is required'),
      password: z.string().min(1, 'Password is required')
    })
    .strict()
});
