import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // O domínio que queremos redirecionar (a origem)
  const sourceDomain = 'studio--studio-1716481110-b0153.us-central1.hosted.app';
  // O domínio final para onde queremos apontar (o destino)
  const targetDomain = 'demokratia.pt';
  
  // 'x-forwarded-host' é o cabeçalho mais fiável para obter o anfitrião original num ambiente de proxy.
  // Usamos o 'host' normal como alternativa.
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  // A lógica agora é simples e segura:
  // SÓ redirecionamos se o pedido vier EXATAMENTE do nosso domínio de alojamento.
  if (host === sourceDomain) {
      const newUrl = new URL(request.url);
      newUrl.hostname = targetDomain;
      newUrl.protocol = 'https';
      newUrl.port = ''; // Garante que a porta não é incluída

      // Usamos 308 (redirecionamento permanente que preserva o método do pedido)
      return NextResponse.redirect(newUrl, 308);
  }

  // Para todos os outros casos (incluindo já estar em demokratia.pt), não fazemos nada.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de pedido, exceto os que começam com:
     * - api (rotas de API)
     * - _next/static (ficheiros estáticos)
     * - _next/image (ficheiros de otimização de imagem)
     * - ads.txt (ficheiro de verificação do AdSense)
     * - robots.txt (ficheiro de instruções para crawlers)
     * - favicon.ico (ficheiro favicon)
     */
    '/((?!api|_next/static|_next/image|ads.txt|robots.txt|favicon.ico).*)',
  ],
}
