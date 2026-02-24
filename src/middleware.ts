import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // EXCEÇÃO CRÍTICA: Nunca redirecionar ficheiros de sistema ou estáticos
  // Isto garante que o AdSense encontra o ads.txt e o Google encontra o robots.txt
  const systemFiles = ['/ads.txt', '/robots.txt', '/favicon.ico', '/sitemap.xml'];
  if (systemFiles.includes(pathname)) {
    return NextResponse.next();
  }

  const sourceDomain = 'studio--studio-1716481110-b0153.us-central1.hosted.app';
  const targetDomain = 'demokratia.pt';
  
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

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
     * - Ficheiros estáticos específicos
     */
    '/((?!api|_next/static|_next/image|ads.txt|robots.txt|favicon.ico).*)',
  ],
}
