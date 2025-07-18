// middleware.ts

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // If the user is trying to access a protected route and is not logged in,
  // redirect them to the login page.
  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If the user is logged in and tries to visit the login page,
  // redirect them to the intake page (or a dashboard later).
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/intake', req.url));
  }

  // Allow the request to proceed if no redirection is needed
  return NextResponse.next();
});

// --- THIS IS THE CRUCIAL CHANGE ---
export const config = {
  // We are adding the 'runtime' property here.
  // This forces the middleware to use the Node.js runtime.
  runtime: 'nodejs',
  
  // The matcher configuration stays the same.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};