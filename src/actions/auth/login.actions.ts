'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';

import { env } from '@/config/env';
import { backend } from '@/lib/api/backend';
import type { ApiResponse, LoginDto, LoginResponse } from '@/types';
import type { ActionResult } from './auth.actions';

const IS_PROD = env.NODE_ENV === 'production';

export async function login(dto: LoginDto): Promise<ActionResult<{ access_token: string }>> {
  try {
    const response = await backend.post<ApiResponse<LoginResponse>>('/auth/login', dto);
    const accessToken = response.data.data.access_token;

    const setCookieHeaders = response.headers['set-cookie'] as string[] | undefined;

    if (setCookieHeaders) {
      const refreshCookie = setCookieHeaders.find((c) => c.startsWith('refresh_token='));

      if (refreshCookie) {
        const match = /refresh_token=([^;]+)/.exec(refreshCookie);

        if (match?.[1]) {
          const maxAgeMatch = /Max-Age=(\d+)/i.exec(refreshCookie);
          const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 30 * 24 * 60 * 60;

          const cookieStore = await cookies();
          cookieStore.set('refresh_token', match[1], {
            httpOnly: true,
            secure: IS_PROD,
            sameSite: 'strict',
            path: '/',
            maxAge,
          });
        }
      }
    }

    return { data: { access_token: accessToken } };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const err = error.response.data as { message: string | string[] };
      const message = Array.isArray(err.message) ? err.message[0] : err.message;
      return { error: message };
    }

    return { error: 'Network error. Please try again.' };
  }
}
