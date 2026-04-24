import 'server-only';

import axios from 'axios';

import { env } from '@/config/env';

/**
 * Server-side axios instance for backend API calls.
 * Used in server actions, DAL, and API routes.
 */
export const backend = axios.create({
  baseURL: env.BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});
