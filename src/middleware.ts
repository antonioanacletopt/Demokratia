import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Em ambientes de produção por trás de um proxy, 'x-forwarded-host' é mais fiável.
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  // Lógica de redirecionamento robusta:
  // Se o anfitrião do pedido existir e terminar com '.hosted.app',
  // redireciona para o domínio canónico.
  if (host && host.endsWith('.hosted.app')) {
    
    // Confirma que não estamos já no domínio canónico para evitar loops
    if (!host.includes('demokratia.pt')) {
      const newUrl = new URL(request.url)
      newUrl.hostname = 'demokratia.pt'
      newUrl.protocol = 'https'
      newUrl.port = '' // Garante que a porta não é incluída no URL final

      // Usa um redirecionamento permanente (308), que preserva o método do pedido.
      return NextResponse.redirect(newUrl, 308)
    }
  }

  // Se não houver correspondência, continua para o pedido original.
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de pedido, exceto os que começam com:
     * - api (rotas de API)
     * - _next/static (ficheiros estáticos)
     * - _next/image (ficheiros de otimização de imagem)
     * - favicon.ico (ficheiro favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
