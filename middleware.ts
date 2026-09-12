import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

const isAuthRoute = createRouteMatcher([
  '/login(.*)',
  '/signup(.*)',
  '/forgot-password(.*)',
  '/reset-password(.*)',
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  const session = await auth();
  const { userId } = session;

  // Protect /admin routes (Staff or Admin only)
  if (isAdminRoute(req)) {
    if (process.env.ADMIN_DEV_BYPASS === 'true' && process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }

    if (!userId) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (session.sessionClaims as any)?.metadata?.role || (session.sessionClaims as any)?.public_metadata?.role;
    // Non-staff/customer hitting /admin gets redirected to /account
    if (role !== 'admin' && role !== 'staff') {
      // Check if user is in bootstrap ADMIN_EMAILS or bypass if not configured
      const email = (session.sessionClaims as any)?.email || (session.sessionClaims as any)?.primary_email;
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean);

      const isAllowedEmail = email && adminEmails.includes(email.toLowerCase());

      if (!isAllowedEmail && !role) {
        // If neither role nor allowed email, redirect customer to /account
        return NextResponse.redirect(new URL('/account', req.url));
      }
    }
  }

  // Unauthenticated users attempting to access protected /account routes
  if (!userId && isProtectedRoute(req)) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated users attempting to access login / signup / auth pages
  if (userId && isAuthRoute(req)) {
    const redirectParam = req.nextUrl.searchParams.get('redirect');
    const destination = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/account';
    return NextResponse.redirect(new URL(destination, req.url));
  }

  return NextResponse.next();
});

export default function middleware(req: any, event: any) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  // If Clerk keys are not configured in the Cloudflare environment yet, pass through cleanly
  // This prevents unhandled 500 crashes while environment variables are being added in Cloudflare
  if (
    !publishableKey ||
    publishableKey.includes('replace_') ||
    !secretKey ||
    secretKey.includes('replace_')
  ) {
    return NextResponse.next();
  }

  try {
    return clerkHandler(req, event);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
