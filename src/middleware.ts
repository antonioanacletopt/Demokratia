import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// clerkMiddleware initialises Clerk auth headers for server components.
// It does NOT protect any routes — protection is handled in individual pages/APIs.
export default clerkMiddleware((_auth, _req: NextRequest) => {
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
