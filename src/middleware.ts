import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const runtime = 'experimental-edge';

const isPublicRoute = createRouteMatcher([
  '/',
  '/home(.*)',
  '/login(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/cookies(.*)',
  '/faq(.*)',
  '/methodology(.*)',
  '/partidos(.*)',
  '/library(.*)',
  '/explorar(.*)',
  '/transparencia-politica(.*)',
  '/verificar(.*)',
  '/financas(.*)',
  '/map(.*)',
  '/scenarios(.*)',
  '/instituicoes(.*)',
  '/proposals(.*)',
  '/investor(.*)',
  '/marketing-preview(.*)',
  '/api/(.*)',
  '/robots.txt',
  '/sitemap.xml',
  '/ads.txt',
  '/icon.svg',
  '/sso-callback(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
