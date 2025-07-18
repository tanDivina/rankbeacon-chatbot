import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname
  const { pathname } = request.nextUrl;
  
  // Allow these paths without auth check
  const publicPaths = ['/login', '/api/auth', '/_next', '/favicon.ico'];
  
  // Check if it's a public path
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check for auth cookie (NextAuth sets this)
  const sessionToken = request.cookies.get('authjs.session-token') || 
                      request.cookies.get('__Secure-authjs.session-token');
  
  // If no session token, redirect to login
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
