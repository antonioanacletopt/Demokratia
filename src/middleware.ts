import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ACESSO PÚBLICO TOTAL: Garantir que crawlers e anónimos acedem a ficheiros de sistema sem restrições
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
    '/((?!api|_next/static|_next/image).*)',
  ],
}
