import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Immediately pass through all static files, Next internals, and public endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/__clerk') ||
    pathname.includes('.') ||
    pathname === '/admin/login' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/sso-callback' ||
    pathname === '/' ||
    pathname.startsWith('/shop') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/lookbook') ||
    pathname.startsWith('/drops') ||
    pathname.startsWith('/faq') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/size-guide') ||
    pathname.startsWith('/shipping') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/checkout')
  ) {
    return NextResponse.next();
  }

  // 2. Protect /account routes: if no __session or client auth cookie, redirect to /login
  if (pathname.startsWith('/account')) {
    const hasSession = req.cookies.has('__session') || req.cookies.has('__client_uat');
    if (!hasSession) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect /admin routes (except /admin/login):
  if (pathname.startsWith('/admin')) {
    const hasSession = req.cookies.has('__session') || req.cookies.has('__client_uat');
    if (!hasSession && process.env.ADMIN_DEV_BYPASS !== 'true') {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|models|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|glb|css|js)).*)',
  ],
};
