'use server';

import type { LoginDto, LoginResult } from '@/types';
import { backendPost, type ActionResult } from './auth.actions';

export async function login(dto: LoginDto): Promise<ActionResult<LoginResult>> {
  const result = await backendPost<LoginDto, LoginResult>('/auth/login', dto);

  if (!result.ok || !result.data) {
    return { error: result.error ?? 'Login failed' };
  }

  return { data: result.data };
}
