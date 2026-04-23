import { env } from '@/config/env';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${env.BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!backendRes.ok) {
      return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }

    const body = (await backendRes.json()) as { data: { access_token: string } };

    const response = NextResponse.json(body);

    const setCookieHeader = backendRes.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }

    return response;
  } catch {
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
