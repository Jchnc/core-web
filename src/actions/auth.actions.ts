'use server';

import { cookies } from 'next/headers';

import { env } from '@/config/env';
import type { ApiResponse } from '@/types';

const BACKEND_URL = env.BACKEND_URL;
const IS_PROD = env.NODE_ENV === 'production';

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Backend POST action
 * @param path API path
 * @param body Request body
 * @param cookieHeader Optional cookie header
 * @returns HTTP response
 */
export async function backendPost<TBody, TResponse>(
  path: string,
  body: TBody,
  cookieHeader?: string,
): Promise<{ ok: boolean; status: number; data?: TResponse; error?: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = (await res.json()) as { message: string | string[] };
      const message = Array.isArray(err.message) ? err.message[0] : err.message;
      return { ok: false, status: res.status, error: message };
    }

    const data = (await res.json()) as ApiResponse<TResponse>;
    return { ok: true, status: res.status, data: data.data };
  } catch {
    return { ok: false, status: 500, error: 'Network error. Please try again.' };
  }
}

/**
 * Set refresh cookie
 * @param cookieHeader Cookie header from response
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
