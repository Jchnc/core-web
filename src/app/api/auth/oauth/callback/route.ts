import { env } from '@/config/env';
import { type NextRequest, NextResponse } from 'next/server';
import { backend } from '@/lib/api/backend';

const IS_PROD = env.NODE_ENV === 'production';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }

  try {
    const exchangeRes = await backend.post<{ data: { access_token: string } }>(
      '/auth/oauth/exchange',
      { code },
    );

    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    const setCookieHeader = exchangeRes.headers['set-cookie'];
    if (setCookieHeader) {
      const cookiesArr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      for (const raw of cookiesArr) {
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
          else if (lower.startsWith('samesite='))
            options.sameSite = attr.split('=')[1]?.toLowerCase();
          else if (lower.startsWith('max-age=')) options.maxAge = Number(attr.split('=')[1]);
        }

        response.cookies.set(name, value, options);
      }
    }

    const accessToken = exchangeRes.data.data.access_token;

    response.cookies.set('oauth_access_token', accessToken, {
      httpOnly: false,
      secure: IS_PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 30,
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
