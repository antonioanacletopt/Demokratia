import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// =============================================================================
// REGRA CRÍTICA — ADSENSE / GOOGLE CRAWLERS
// NUNCA remover estas excepções. Os bots do Google NÃO seguem redirects e
// marcam o site como "indisponível" se receberem qualquer redirect (30x).
// Bots afectados: Mediapartners-Google, AdsBot-Google, Googlebot
// Ficheiros críticos: /ads.txt, /robots.txt, /sitemap.xml
// Ver: ADSENSE_RULES.md na raiz do projecto
// =============================================================================

const GOOGLE_BOT_PATTERNS = [
  'mediapartners-google',
  'adsbot-google',
  'googlebot',
  'google-inspectiontool',
  'chrome-lighthouse',
  'pagespeed',
];

// Routes that require authentication
const _isProtected = createRouteMatcher(['/profile(.*)', '/admin(.*)']);

export default clerkMiddleware(async (_auth, request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const userAgent = (request.headers.get('user-agent') ?? '').toLowerCase();
  const isGoogleBot = GOOGLE_BOT_PATTERNS.some(p => userAgent.includes(p));

  // REGRA 1: Ficheiros de verificação — sempre acesso directo
  if (
    pathname === '/ads.txt' ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    pathname === '/sitemap.xml' ||
    pathname === '/googlef748ce26d96326d2.html' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // REGRA 2: Raiz "/" — redirecionar para "/home"
  // Bots recebem 200 directo; humanos recebem redirect 302.
  if (pathname === '/') {
    if (isGoogleBot) return NextResponse.next();
    return NextResponse.redirect(new URL('/home', request.url), 302);
  }

  if (isGoogleBot) return NextResponse.next();

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|ads.txt|robots.txt).*)',
  ],
};
