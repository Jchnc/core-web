'use server';

import { AxiosError } from 'axios';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { backend } from '@/lib/api/backend';
import type { ApiResponse, User, UpdateUserDto } from '@/types';

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) return null;

  try {
    const { data } = await backend.post<{ data: { access_token: string } }>(
      '/auth/session',
      {},
      {
        headers: { Cookie: `refresh_token=${refreshToken}` },
      },
    );

    return data.data.access_token;
  } catch {
    return null;
  }
}

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function updateProfile(
  userId: string,
  dto: UpdateUserDto,
): Promise<ActionResult<User>> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { error: 'Unauthorized' };
  }

  try {
    const response = await backend.patch<ApiResponse<User>>(`/users/${userId}`, dto, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/profile');
    return { data: response.data.data };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const err = error.response.data as { message: string };
      return { error: err.message ?? 'Update failed' };
    }

    return { error: 'Network error. Please try again.' };
  }
}
