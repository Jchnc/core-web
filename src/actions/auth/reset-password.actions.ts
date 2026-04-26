'use server';

import type { ResetPasswordDto } from '@/types';
import { backendPost, type ActionResult } from './auth.actions';

export async function resetPassword(dto: ResetPasswordDto): Promise<ActionResult> {
  const result = await backendPost<ResetPasswordDto, null>('/auth/reset-password', dto);

  if (!result.ok) {
    return { error: result.error ?? 'Reset failed' };
  }

  return {};
}
