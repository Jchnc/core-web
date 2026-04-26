'use server';

import type { RegisterDto } from '@/types';
import { backendPost, type ActionResult } from './auth.actions';

export async function register(
  dto: RegisterDto,
): Promise<ActionResult<{ id: string; email: string; name: string }>> {
  const result = await backendPost<RegisterDto, { id: string; email: string; name: string }>(
    '/auth/register',
    dto,
  );

  if (!result.ok || !result.data) {
    return { error: result.error ?? 'Registration failed' };
  }

  return { data: result.data };
}
