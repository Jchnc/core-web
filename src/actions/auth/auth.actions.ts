'use server';

import { AxiosError, type AxiosResponse } from 'axios';
import { cookies, headers } from 'next/headers';

import { backend } from '@/lib/api/backend';
import type { ApiResponse } from '@/types';

export interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

interface BackendResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

function extractErrorMessage(error: unknown): BackendResult<never> {
  if (error instanceof AxiosError && error.response) {
    const err = error.response.data as { message: string | string[] };
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    return { ok: false, status: error.response.status, error: message };
  }

  return { ok: false, status: 500, error: 'Network error. Please try again.' };
}

async function forwardSetCookies(response: AxiosResponse): Promise<void> {
  const setCookieHeader = response.headers['set-cookie'];
  if (!setCookieHeader) return;

  const cookieStore = await cookies();
  const cookieStrings = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

  for (const raw of cookieStrings) {
    const parts = raw.split(';').map((s) => s.trim());
    const [nameValue, ...attrs] = parts;
    if (!nameValue) continue;

    const eqIndex = nameValue.indexOf('=');
    if (eqIndex === -1) continue;

    const name = nameValue.slice(0, eqIndex);
    const value = nameValue.slice(eqIndex + 1);

    const options: Record<string, unknown> = {};
    for (const attr of attrs) {
      const lower = attr.toLowerCase();
      if (lower === 'httponly') options.httpOnly = true;
      else if (lower === 'secure') options.secure = true;
      else if (lower.startsWith('path=')) options.path = attr.split('=')[1];
      else if (lower.startsWith('samesite=')) options.sameSite = attr.split('=')[1]?.toLowerCase();
      else if (lower.startsWith('max-age=')) options.maxAge = Number(attr.split('=')[1]);
    }

    cookieStore.set(name, value, options);
  }
}

async function getForwardingHeaders(): Promise<Record<string, string>> {
  const reqHeaders = await headers();
  const forwardHeaders: Record<string, string> = {};

  const userAgent = reqHeaders.get('user-agent');
  if (userAgent) forwardHeaders['user-agent'] = userAgent;

  const forwardedFor = reqHeaders.get('x-forwarded-for');
  if (forwardedFor) forwardHeaders['x-forwarded-for'] = forwardedFor;

  const realIp = reqHeaders.get('x-real-ip');
  if (realIp) forwardHeaders['x-real-ip'] = realIp;

  const cookieHeader = reqHeaders.get('cookie');
  if (cookieHeader) forwardHeaders['cookie'] = cookieHeader;

  return forwardHeaders;
}

export async function backendPost<TBody, TResponse>(
  path: string,
  body: TBody,
  headerOverrides?: Record<string, string>,
): Promise<BackendResult<TResponse>> {
  try {
    const forwardHeaders = await getForwardingHeaders();
    const response = await backend.post<ApiResponse<TResponse>>(path, body, {
      headers: { ...forwardHeaders, ...(headerOverrides ?? {}) },
    });

    await forwardSetCookies(response);

    return { ok: true, status: response.status, data: response.data.data };
  } catch (error) {
    return extractErrorMessage(error);
  }
}

export async function backendGet<TResponse>(
  path: string,
  headerOverrides?: Record<string, string>,
): Promise<BackendResult<TResponse>> {
  try {
    const forwardHeaders = await getForwardingHeaders();
    const response = await backend.get<ApiResponse<TResponse>>(path, {
      headers: { ...forwardHeaders, ...(headerOverrides ?? {}) },
    });

    return { ok: true, status: response.status, data: response.data.data };
  } catch (error) {
    return extractErrorMessage(error);
  }
}
