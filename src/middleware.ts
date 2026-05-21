import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal passthrough middleware — Clerk auth is handled client-side via useUser()
// and server-side in individual API routes via auth() from @clerk/nextjs/server.
export default function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
