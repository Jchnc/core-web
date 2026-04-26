'use server';

import { getAccessToken } from '@/lib/api/auth/get-access-token';
import { backendPost, type ActionResult } from './auth.actions';

interface SetPasswordDto {
  password: string;
}

export async function setPassword(password: string): Promise<ActionResult> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { error: 'Unauthorized' };

  const result = await backendPost<SetPasswordDto, null>(
    '/auth/set-password',
    { password },
    {
      Authorization: `Bearer ${accessToken}`,
    },
  );

  if (!result.ok) return { error: result.error ?? 'Failed to set password' };

  return {};
}
