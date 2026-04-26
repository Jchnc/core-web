'use server';

import type { ForgotPasswordDto } from '@/types';
import { backendPost, type ActionResult } from './auth.actions';

export async function forgotPassword(dto: ForgotPasswordDto): Promise<ActionResult> {
  const result = await backendPost<ForgotPasswordDto, null>('/auth/forgot-password', dto);

  if (!result.ok) {
    return { error: result.error ?? 'Request failed' };
  }

  return {};
}
