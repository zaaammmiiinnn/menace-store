import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
]);

const isAuthRoute = createRouteMatcher([
  '/login(.*)',
  '/signup(.*)',
  '/forgot-password(.*)',
  '/reset-password(.*)',
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

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
  ],
};
