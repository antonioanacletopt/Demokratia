import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // O domínio canónico que queremos impor.
  const canonicalDomain = 'demokratia.pt';
  
  // O cabeçalho 'x-forwarded-host' é a fonte mais fiável para o anfitrião original num ambiente de proxy.
  const host = request.headers.get('x-forwarded-host');

  // Se o cabeçalho 'host' existir e NÃO for o nosso domínio canónico, então devemos redirecionar.
  // Esta verificação é mais direta e evita loops, pois apenas redireciona se o anfitrião
  // não for exatamente o que pretendemos.
  if (host && !host.endsWith(canonicalDomain)) {
      const newUrl = new URL(request.url);
      newUrl.hostname = canonicalDomain;
      newUrl.protocol = 'https';
      newUrl.port = ''; // Garante que a porta não é incluída

      // Usa um redirecionamento permanente (308) que preserva o método do pedido (GET, POST, etc.)
      return NextResponse.redirect(newUrl, 308);
  }

  // Se não houver necessidade de redirecionar, continua para o pedido.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de pedido, exceto os que começam com:
     * - api (rotas de API)
     * - _next/static (ficheiros estáticos)
     * - _next/image (ficheiros de otimização de imagem)
     * - favicon.ico (ficheiro favicon)
     * - ads.txt (ficheiro de verificação do AdSense)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|ads.txt).*)',
  ],
}
