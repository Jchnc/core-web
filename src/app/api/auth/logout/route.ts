import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);

  response.cookies.delete('refresh_token');

  return response;
}
