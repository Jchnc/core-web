'use server';

import { cookies } from 'next/headers';

import { env } from '@/config/env';
import type { LoginDto, LoginResponse } from '@/types';
import { backendPost, type ActionResult } from '../auth.actions';

const IS_PROD = env.NODE_ENV === 'production';

/**
 * Login action
 * @param dto Login DTO
 * @returns ActionResult with access token
 */
export async function login(dto: LoginDto): Promise<ActionResult<{ access_token: string }>> {
  const result = await backendPost<LoginDto, LoginResponse>('/auth/login', dto);

  if (!result.ok || !result.data) {
    return { error: result.error ?? 'Login failed' };
  }

  const cookieStore = await cookies();
  const rawToken = result.data.access_token;

  cookieStore.set('refresh_token', rawToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    path: '/api/auth/refresh',
    maxAge: 30 * 24 * 60 * 60,
  });

  return { data: { access_token: result.data.access_token } };
}
