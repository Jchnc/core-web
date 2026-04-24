'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';

import { env } from '@/config/env';
import { backend } from '@/lib/api/backend';
import type { ApiResponse } from '@/types';

const IS_PROD = env.NODE_ENV === 'production';

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Generic POST to backend API.
 * @param path API path (e.g. '/auth/login')
 * @param body Request body
 * @param cookieHeader Optional cookie header for forwarding
 */
export async function backendPost<TBody, TResponse>(
  path: string,
  body: TBody,
  cookieHeader?: string,
): Promise<{ ok: boolean; status: number; data?: TResponse; error?: string }> {
  try {
    const response = await backend.post<ApiResponse<TResponse>>(path, body, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    });

    return { ok: true, status: response.status, data: response.data.data };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const err = error.response.data as { message: string | string[] };
      const message = Array.isArray(err.message) ? err.message[0] : err.message;
      return { ok: false, status: error.response.status, error: message };
    }

    return { ok: false, status: 500, error: 'Network error. Please try again.' };
  }
}

/**
 * Set refresh cookie from raw Set-Cookie header
 */
export async function setRefreshCookie(cookieHeader: string): Promise<void> {
  const match = /refresh_token=([^;]+)/.exec(cookieHeader);
  if (!match) return;

  const tokenValue = match[1];
  const maxAgeMatch = /Max-Age=(\d+)/i.exec(cookieHeader);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 30 * 24 * 60 * 60;

  void cookies().then((store) => {
    store.set('refresh_token', tokenValue!, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge,
    });
  });
}
