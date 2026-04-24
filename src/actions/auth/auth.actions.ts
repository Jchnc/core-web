'use server';

import { AxiosError } from 'axios';

import { backend } from '@/lib/api/backend';
import type { ApiResponse } from '@/types';

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function backendPost<TBody, TResponse>(
  path: string,
  body: TBody,
  cookieHeader?: string,
): Promise<{ ok: boolean; status: number; data?: TResponse; error?: string }> {
  try {
    const response = await backend.post<ApiResponse<TResponse>>(path, body, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    });

    return { ok: true, status: response.status, data: response.data.data };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const err = error.response.data as { message: string | string[] };
      const message = Array.isArray(err.message) ? err.message[0] : err.message;
      return { ok: false, status: error.response.status, error: message };
    }

    return { ok: false, status: 500, error: 'Network error. Please try again.' };
  }
}
