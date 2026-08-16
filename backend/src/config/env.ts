import 'dotenv/config';
import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV ?? 'development';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(10),
  OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(4),
  APP_TIME_ZONE: z.string().min(1).default('Asia/Kolkata'),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  RAZORPAY_API_BASE_URL: z.string().url().default('https://api.razorpay.com/v1'),
  COOKIE_SECRET: z.string().min(16).optional().default('cookie-secret-dev-min-16-chars'),
  COOKIE_SECURE: z.coerce.boolean().optional().default(false),
  COOKIE_SAMESITE: z.enum(['strict', 'lax', 'none']).optional().default('lax'),
  CORS_ORIGINS: z.string().optional(),
  CLIENT_ORIGIN: z.string().url().optional().default('http://localhost:5173'),
  ADMIN_ORIGIN: z.string().url().optional().default('http://localhost:5174'),
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  AWS_REGION: z.string().min(1).default('ap-south-1'),
  S3_BUCKET: z.string().min(1).optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional()
});

const parsed = envSchema.safeParse({
  ...process.env,
  NODE_ENV: nodeEnv,
  MONGODB_URI:
    process.env.MONGODB_URI ??
    (nodeEnv === 'test' ? 'mongodb://localhost:27017/go_courier_service_test' : undefined),
  JWT_SECRET: process.env.JWT_SECRET ?? (nodeEnv === 'test' ? 'test-secret-that-is-long-enough' : undefined),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? (nodeEnv === 'test' ? 'rzp_test_unit_key' : undefined),
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ?? (nodeEnv === 'test' ? 'rzp_test_unit_secret' : undefined),
  RAZORPAY_WEBHOOK_SECRET:
    process.env.RAZORPAY_WEBHOOK_SECRET ?? (nodeEnv === 'test' ? 'unit_webhook_secret' : undefined),
  AWS_ACCESS_KEY_ID:
    process.env.AWS_ACCESS_KEY_ID ?? (nodeEnv === 'test' ? 'test-access-key' : undefined),
  AWS_SECRET_ACCESS_KEY:
    process.env.AWS_SECRET_ACCESS_KEY ?? (nodeEnv === 'test' ? 'test-secret-key' : undefined),
  S3_BUCKET: process.env.S3_BUCKET ?? (nodeEnv === 'test' ? 'test-bucket' : undefined),
  S3_PUBLIC_BASE_URL:
    process.env.S3_PUBLIC_BASE_URL ??
    (nodeEnv === 'test' ? 'https://test-bucket.s3.amazonaws.com' : undefined)
});

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const env = parsed.data;

const DEFAULT_CORS_ORIGINS = [
  'https://admin.gocourierservice.com',
  'https://gocourierservice.com'
];

export function corsOrigins(): string[] {
  const fromCsv = (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...fromCsv, env.CLIENT_ORIGIN, env.ADMIN_ORIGIN, ...DEFAULT_CORS_ORIGINS])];
}
