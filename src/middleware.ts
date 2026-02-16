import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Apenas executa esta lógica em produção.
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const requestHost = request.nextUrl.hostname
  const canonicalDomain = process.env.CANONICAL_DOMAIN
  const hostedDomain = process.env.HOSTED_DOMAIN

  // Se as variáveis de ambiente não estiverem definidas, não faz nada.
  // Esta verificação é importante para a robustez.
  if (!canonicalDomain || !hostedDomain) {
    console.warn("CANONICAL_DOMAIN or HOSTED_DOMAIN environment variables are not set. Skipping redirect middleware.");
    return NextResponse.next()
  }

  // Se o pedido for para o domínio de alojamento padrão, redireciona para o domínio canónico.
  if (requestHost === hostedDomain) {
    const newUrl = new URL(request.url)
    newUrl.hostname = canonicalDomain
    newUrl.protocol = 'https'
    newUrl.port = '' // Garante que não transportamos um número de porta

    // Usa um redirecionamento permanente 301
    return NextResponse.redirect(newUrl, 301)
  }

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
