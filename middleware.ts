import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth0';

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/api/auth/') ||
    request.nextUrl.pathname === '/force-logout'
  ) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const session = await getSession(request);
      
      // Redirect to home if not logged in
      if (!session?.user) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Device validation happens in the page component
      // This just checks auth
    } catch (error) {
      console.error('Middleware error:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

