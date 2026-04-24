'use server';

import { getAccessToken } from '@/lib/api/auth/get-access-token';
import { backend } from '@/lib/api/backend';
import { AxiosError } from 'axios';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types';

/**
 * Delete a user by ID
 * @param userId The ID of the user to delete
 * @returns ActionResult indicating success or failure
 */
export async function deleteUser(userId: string): Promise<ActionResult> {
  const accessToken = await getAccessToken();

  if (!accessToken) return { error: 'Unauthorized' };

  try {
    const response = await backend.delete(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    revalidatePath('/admin/users');
    return { data: response.data.data };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const err = error.response.data as { message: string };
      return { error: err.message ?? 'Failed to delete user' };
    }
    return { error: 'Network error' };
  }
}
