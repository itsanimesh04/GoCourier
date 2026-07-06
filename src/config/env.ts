import 'dotenv/config';
import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV ?? 'development';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(10),
  OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(4),
  APP_TIME_ZONE: z.string().min(1).default('Asia/Kolkata'),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  RAZORPAY_API_BASE_URL: z.string().url().default('https://api.razorpay.com/v1')
});

const parsed = envSchema.safeParse({
  ...process.env,
  NODE_ENV: nodeEnv,
  DATABASE_URL:
    process.env.DATABASE_URL ??
    (nodeEnv === 'test' ? 'postgres://postgres:postgres@localhost:5432/go_courier_service_test' : undefined),
  JWT_SECRET: process.env.JWT_SECRET ?? (nodeEnv === 'test' ? 'test-secret-that-is-long-enough' : undefined),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? (nodeEnv === 'test' ? 'rzp_test_unit_key' : undefined),
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ?? (nodeEnv === 'test' ? 'rzp_test_unit_secret' : undefined),
  RAZORPAY_WEBHOOK_SECRET:
    process.env.RAZORPAY_WEBHOOK_SECRET ?? (nodeEnv === 'test' ? 'unit_webhook_secret' : undefined)
});

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = parsed.data;
