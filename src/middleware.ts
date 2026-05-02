import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/verify'];

// Routes that authenticated users should be redirected away from
const authOnlyRoutes = ['/login', '/register', '/verify'];

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'wesal-fallback-secret-change-me'
);

async function getSessionUser(request: NextRequest) {
  try {
    const token = request.cookies.get('wesal-session')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, AUTH_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes and static files
  const isApiRoute = pathname.startsWith('/api');
  const isStaticFile = pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname);

  if (isApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  // Get session
  const user = await getSessionUser(request);

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isAuthRoute = authOnlyRoutes.some(route => pathname === route);

  // If user is authenticated and trying to access auth-only routes (login/register),
  // redirect to community
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/community';
    return NextResponse.redirect(redirectUrl);
  }

  // If user is NOT authenticated and trying to access protected routes,
  // redirect to landing page
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
