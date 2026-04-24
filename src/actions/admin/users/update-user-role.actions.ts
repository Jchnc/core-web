'use server';

import { AxiosError } from 'axios';
import { revalidatePath } from 'next/cache';
import { getAccessToken } from '@/lib/api/auth/get-access-token';
import { backend } from '@/lib/api/backend';
import type { ActionResult, ApiResponse, UpdateRoleDto, User } from '@/types';

/**
 * Update a user's role
 * @param userId The ID of the user to update
 * @param dto The role update data
 * @returns ActionResult indicating success or failure
 */
export async function updateUserRole(
  userId: string,
  dto: UpdateRoleDto,
): Promise<ActionResult<User>> {
  const accessToken = await getAccessToken();

  if (!accessToken) return { error: 'Unauthorized' };

  try {
    const response = await backend.patch<ApiResponse<User>>(`/users/${userId}/role`, dto, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/admin/users');
    return { data: response.data.data };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const err = error.response.data as { message: string };
      return { error: err.message ?? 'Failed to update role' };
    }
    return { error: 'Network error' };
  }
}
