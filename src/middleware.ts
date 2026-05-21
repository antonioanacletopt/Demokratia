import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Passthrough middleware — Clerk runs client-side only to avoid
// satellite domain handshake redirect loop on Cloudflare Workers.
export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
