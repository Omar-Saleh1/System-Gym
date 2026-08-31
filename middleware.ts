import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const cleanToken = token.replace('Bearer ', '').trim();
    const parts = cleanToken.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('authorization') || undefined;
  const valid = isTokenValid(token);

  const isLoginRoute = request.nextUrl.pathname.startsWith('/login');
  const isPublicQrRoute = request.nextUrl.pathname.startsWith('/member/qr');

  if (!valid && !isLoginRoute && !isPublicQrRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('token', '', { path: '/', expires: new Date(0) });
    return response;
  }

  if (valid && isLoginRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

