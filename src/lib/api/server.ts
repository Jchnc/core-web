import 'server-only';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';

import type { ApiError } from '@/types';
import { backend } from './backend';

export class ServerApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: string[],
  ) {
    super(message);
    this.name = 'ServerApiError';
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) return {};

  try {
    const { data } = await backend.post<{ data: { access_token: string } }>('/auth/refresh', null, {
      headers: { Cookie: `refresh_token=${refreshToken}` },
    });

    return { Authorization: `Bearer ${data.data.access_token}` };
  } catch {
    return {};
  }
}

interface ServerFetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function serverFetch<T>(path: string, options: ServerFetchOptions = {}): Promise<T> {
  const authHeader = await getAuthHeader();

  try {
    const response = await backend.request<T>({
      url: path,
      method: options.method ?? 'GET',
      headers: { ...authHeader, ...options.headers },
      data: options.body,
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const apiError = error.response.data as ApiError;
      const message = Array.isArray(apiError.message) ? apiError.message[0] : apiError.message;
      throw new ServerApiError(error.response.status, message ?? 'Request failed');
    }

    throw new ServerApiError(500, 'Network error');
  }
}
