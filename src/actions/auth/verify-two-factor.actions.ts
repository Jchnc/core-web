'use server';

import type { LoginResponse, VerifyTwoFactorDto } from '@/types';
import { backendPost, type ActionResult } from './auth.actions';

export async function verifyTwoFactor(
  dto: VerifyTwoFactorDto,
): Promise<ActionResult<LoginResponse>> {
  const result = await backendPost<VerifyTwoFactorDto, LoginResponse>('/auth/2fa/verify', dto);

  if (!result.ok || !result.data) {
    return { error: result.error ?? 'Verification failed' };
  }

  return { data: result.data };
}
