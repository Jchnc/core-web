import 'server-only';

import { env } from '@/config/env';
import type { ApiError } from '@/types';
import { cookies } from 'next/headers';

const BACKEND_URL = env.BACKEND_URL;

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export class ServerApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: string[],
  ) {
    super(message);
    this.name = 'ServerApiError';
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) return {};

  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${refreshToken}` },
      cache: 'no-store',
    });

    if (!res.ok) return {};

    const { data } = (await res.json()) as { data: { access_token: string } };
    return { Authorization: `Bearer ${data.access_token}` };
  } catch {
    return {};
  }
}

export async function serverFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = (await res.json()) as ApiError;
    const message = Array.isArray(error.message) ? error.message[0] : error.message;
    throw new ServerApiError(res.status, message ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}
