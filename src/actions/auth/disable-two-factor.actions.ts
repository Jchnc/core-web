'use server';

import { revalidatePath } from 'next/cache';

import { getAccessToken } from '@/lib/api/auth/get-access-token';
import { backendPost, type ActionResult } from './auth.actions';

interface DisableTwoFactorDto {
  password: string;
}

export async function disableTwoFactor(password: string): Promise<ActionResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Unauthorized' };

  const result = await backendPost<DisableTwoFactorDto, null>(
    '/auth/2fa/disable',
    { password },
    {
      Authorization: `Bearer ${accessToken}`,
    },
  );

  if (!result.ok) return { error: result.error ?? 'Failed to disable 2FA' };

  revalidatePath('/profile');
  return {};
}
