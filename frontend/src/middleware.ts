import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ignorar rotas públicas e recursos estáticos
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/admin/login' ||
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
