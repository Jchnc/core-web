'use server';

import { AxiosError } from 'axios';

import { getAccessToken } from '@/lib/api/auth/get-access-token';
import { backend } from '@/lib/api/backend';
import type { ActionResult, ApiResponse, PaginatedUsers } from '@/types';

/**
 * Get a paginated list of all users
 * @param params Pagination and search parameters
 * @returns Paginated list of users
 */
export async function getUsers(params: {
  limit?: number;
  cursor?: string;
  search?: string;
}): Promise<ActionResult<PaginatedUsers>> {
  const accessToken = await getAccessToken();

  if (!accessToken) return { error: 'Unauthorized' };

  const query = new URLSearchParams();
  if (params.limit) query.set('limit', String(params.limit));
  if (params.cursor) query.set('cursor', params.cursor);
  if (params.search) query.set('search', params.search);

  try {
    const response = await backend.get<ApiResponse<PaginatedUsers>>(`/users?${query.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return { data: response.data.data };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const err = error.response.data as { message: string };
      return { error: err.message ?? 'Failed to fetch users' };
    }
    return { error: 'Network error' };
  }
}
