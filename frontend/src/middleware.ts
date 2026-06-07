import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ADMIN_PATHS = [
  '/admin/login',
  '/admin/setup',
  '/admin/forgot-password',
  '/admin/reset-password',
];

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    PUBLIC_ADMIN_PATHS.includes(request.nextUrl.pathname) ||
    !request.nextUrl.pathname.startsWith('/admin')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('agendafacil_token');

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
