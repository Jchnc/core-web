'use server';

import { revalidatePath } from 'next/cache';

import { getAccessToken } from '@/lib/api/auth/get-access-token';
import { backendPost, type ActionResult } from './auth.actions';

interface EnableTwoFactorDto {
  password: string;
}

export async function enableTwoFactor(password: string): Promise<ActionResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Unauthorized' };

  const result = await backendPost<EnableTwoFactorDto, null>(
    '/auth/2fa/enable',
    { password },
    {
      Authorization: `Bearer ${accessToken}`,
    },
  );

  if (!result.ok) return { error: result.error ?? 'Failed to enable 2FA' };

  revalidatePath('/profile');
  return {};
}
