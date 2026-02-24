import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // EXCEÇÃO CRÍTICA E TOTAL: Permitir acesso direto e anónimo a ficheiros de sistema e pasta public
  // Isto garante que o AdSense, Google Crawlers e ficheiros estáticos nunca são bloqueados ou redirecionados
  if (
    pathname === '/ads.txt' || 
    pathname === '/robots.txt' || 
    pathname === '/favicon.ico' || 
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const sourceDomain = 'studio--studio-1716481110-b0153.us-central1.hosted.app';
  const targetDomain = 'demokratia.pt';
  
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  // Redirecionamento de domínio apenas se não for um ficheiro estático público
  if (host === sourceDomain) {
      const newUrl = new URL(request.url);
      newUrl.hostname = targetDomain;
      newUrl.protocol = 'https';
      newUrl.port = ''; 
      return NextResponse.redirect(newUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    '/((?!api|_next/static|_next/image).*)',
  ],
}
