import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('authorization');

  const isLoginRoute = request.nextUrl.pathname.startsWith('/login');
  const isPublicQrRoute = request.nextUrl.pathname.startsWith('/member/qr');

  if (!token && !isLoginRoute && !isPublicQrRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isLoginRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
