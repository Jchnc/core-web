'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { env } from '@/config/env';
import type { ApiResponse, User, UpdateUserDto } from '@/types';

const BACKEND_URL = env.BACKEND_URL;

/**
 * Get access token from refresh token
 * @returns Access token or null
 */
async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${refreshToken}` },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const { data } = (await res.json()) as { data: { access_token: string } };
    return data.access_token;
  } catch {
    return null;
  }
}

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

/**
 * Update profile action
 * @param userId User ID
 * @param dto Update user DTO
 * @returns ActionResult with updated user
 */
export async function updateProfile(
  userId: string,
  dto: UpdateUserDto,
): Promise<ActionResult<User>> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { error: 'Unauthorized' };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(dto),
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = (await res.json()) as { message: string };
      return { error: err.message ?? 'Update failed' };
    }

    const { data } = (await res.json()) as ApiResponse<User>;
    revalidatePath('/profile');
    return { data };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}
