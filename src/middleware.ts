import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const canonicalDomain = 'demokratia.pt'
  const hostedDomain = 'studio--studio-1716481110-b0153.us-central1.hosted.app'

  // Tenta obter o anfitrião a partir dos cabeçalhos, que é o método mais fiável
  // em ambientes de produção com proxies.
  const requestHost = request.headers.get('host')

  // Se o pedido for para o domínio de alojamento padrão, redireciona para o domínio canónico.
  if (requestHost === hostedDomain) {
    const newUrl = new URL(request.url)
    newUrl.hostname = canonicalDomain
    newUrl.protocol = 'https'
    newUrl.port = ''

    // Usa um redirecionamento permanente 301, que é o correto para SEO.
    return NextResponse.redirect(newUrl, 301)
  }

  // Para todos os outros pedidos, continua normalmente.
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
