import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// =============================================================================
// REGRA CRÍTICA — ADSENSE / GOOGLE CRAWLERS
// NUNCA remover estas excepções. Os bots do Google NÃO seguem redirects e
// marcam o site como "indisponível" se receberem qualquer redirect (30x).
// Bots afectados: Mediapartners-Google, AdsBot-Google, Googlebot
// Ficheiros críticos: /ads.txt, /robots.txt, /sitemap.xml
// Ver: ADSENSE_RULES.md na raiz do projecto
// =============================================================================

const GOOGLE_BOT_PATTERNS = [
  'Mediapartners-Google',
  'AdsBot-Google',
  'Googlebot',
  'Google-InspectionTool',
  'Chrome-Lighthouse',  // PageSpeed Insights
  'pagespeed',          // PageSpeed variants
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') ?? '';

  // REGRA 1: Ficheiros de verificação — sempre acesso directo, sem redirect
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

  // REGRA 2: Raiz "/" — redirecionar para "/home" aqui no middleware.
  // NUNCA usar permanentRedirect() no page.tsx da raiz: o código 308 é cacheado
  // permanentemente pela CDN do Firebase, fazendo com que o pedido nunca chegue
  // ao middleware e os bots (AdSense/Googlebot/PageSpeed) recebam sempre 308.
  // Bots recebem rewrite (sem redirect HTTP). Humanos recebem redirect 302 (não cacheado).
  if (pathname === '/') {
    const isGoogleBot = GOOGLE_BOT_PATTERNS.some(pattern => userAgent.includes(pattern));
    if (isGoogleBot) {
      return NextResponse.rewrite(new URL('/home', request.url));
    }
    return NextResponse.redirect(new URL('/home', request.url), 302);
  }

  const isGoogleBot = GOOGLE_BOT_PATTERNS.some(pattern => userAgent.includes(pattern));
  if (isGoogleBot) {
    return NextResponse.next();
  }

  // REGRA 3: Redirect do domínio Firebase para o domínio canónico
  // Apenas para utilizadores humanos (não bots)
  const sourceDomain = 'studio--studio-1716481110-b0153.us-central1.hosted.app';
  const targetDomain = 'demokratia.pt';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  if (host === sourceDomain) {
    const newUrl = new URL(request.url);
    newUrl.hostname = targetDomain;
    newUrl.protocol = 'https';
    newUrl.port = '';
    return NextResponse.redirect(newUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|ads.txt|robots.txt).*)',
  ],
}
