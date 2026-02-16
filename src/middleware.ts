import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const canonicalDomain = 'demokratia.pt'
  const requestHost = request.headers.get('host')

  // Lógica de redirecionamento robusta:
  // Se o anfitrião do pedido existir e terminar com '.hosted.app',
  // redireciona para o domínio canónico.
  if (requestHost && requestHost.endsWith('.hosted.app')) {
    
    // Confirma que não estamos já no domínio canónico para evitar loops
    if (requestHost !== canonicalDomain) {
      const newUrl = new URL(request.url)
      newUrl.hostname = canonicalDomain
      newUrl.protocol = 'https'
      newUrl.port = '' // Garante que a porta não é incluída no URL final

      // Usa um redirecionamento permanente (301), que é o correto para SEO.
      return NextResponse.redirect(newUrl, 301)
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
