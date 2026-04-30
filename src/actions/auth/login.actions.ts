'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { LoginDto, LoginResult } from '@/types';
import { backendPost, type ActionResult } from './auth.actions';

export async function login(dto: LoginDto): Promise<ActionResult<LoginResult>> {
  const result = await backendPost<LoginDto, LoginResult>('/auth/login', dto);

  if (!result.ok || !result.data) {
    return { error: result.error ?? 'Login failed' };
  }

  if (result.data && 'requires_2fa' in result.data) {
    return { data: result.data };
  }

  if (result.data && 'access_token' in result.data) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token');

    if (!refreshToken) {
      return { error: 'Session creation failed' };
    }

    redirect('/dashboard');
  }

  return { data: result.data };
}
