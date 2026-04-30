'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { LoginResponse, VerifyTwoFactorDto } from '@/types';
import { backendPost, type ActionResult } from './auth.actions';

export async function verifyTwoFactor(
  dto: VerifyTwoFactorDto,
): Promise<ActionResult<LoginResponse>> {
  const result = await backendPost<VerifyTwoFactorDto, LoginResponse>('/auth/2fa/verify', dto);

  if (!result.ok || !result.data) {
    return { error: result.error ?? 'Verification failed' };
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token');

  if (!refreshToken) {
    return { error: 'Session creation failed' };
  }

  redirect('/dashboard');
}
