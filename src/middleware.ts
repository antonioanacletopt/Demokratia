import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // EXCEÇÃO CRÍTICA: Permitir acesso direto e anónimo a ficheiros de sistema
  // Isto garante que o AdSense e o Google Crawlers nunca são bloqueados ou redirecionados
  const publicStaticFiles = ['/ads.txt', '/robots.txt', '/favicon.ico', '/sitemap.xml'];
  if (publicStaticFiles.includes(pathname)) {
    return NextResponse.next();
  }

  const sourceDomain = 'studio--studio-1716481110-b0153.us-central1.hosted.app';
  const targetDomain = 'demokratia.pt';
  
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  // Redirecionamento de domínio apenas para páginas da app, não para ficheiros estáticos
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