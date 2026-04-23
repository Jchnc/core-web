import { z } from 'zod';

const envSchema = z.object({
  BACKEND_URL: z.url({ message: 'BACKEND_URL must be a valid URL' }),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const _env = envSchema.safeParse({
  BACKEND_URL: process.env.BACKEND_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!_env.success) {
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
