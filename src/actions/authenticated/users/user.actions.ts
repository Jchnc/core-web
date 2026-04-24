'use server';

import { AxiosError } from 'axios';
import { revalidatePath } from 'next/cache';
import { getAccessToken } from '@/lib/api/auth/get-access-token';
import { backend } from '@/lib/api/backend';
import type { ActionResult, ApiResponse, UpdateUserDto, User } from '@/types';

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
