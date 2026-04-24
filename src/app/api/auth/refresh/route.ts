import { AxiosError } from 'axios';
import { type NextRequest, NextResponse } from 'next/server';

import { backend } from '@/lib/api/backend';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  try {
    const response = await backend.post<{ data: { access_token: string } }>('/auth/refresh', null, {
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const nextRes = NextResponse.json(response.data);

    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const cookieValue =
        Array.isArray(setCookieHeader) ? setCookieHeader.join(', ') : setCookieHeader;
      nextRes.headers.set('set-cookie', cookieValue);
    }

    return nextRes;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
