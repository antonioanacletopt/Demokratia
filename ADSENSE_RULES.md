# Regras Críticas — Google AdSense

> **LER ANTES DE ALTERAR `middleware.ts`, `robots.ts`, `apphosting.yaml` ou `layout.tsx`**

## Problema recorrente

O AdSense rejeita o site com "site inativo ou indisponível" quando:
1. O crawler recebe qualquer redirect HTTP (301, 308, etc.)
2. O servidor demora > ~5s a responder (cold start)
3. O `robots.txt` bloqueia ou tem conteúdo inconsistente

## Regras que NÃO podem ser removidas

### 1. `apphosting.yaml` — `minInstances: 1`
```yaml
runConfig:
  minInstances: 1   # ← NUNCA remover. Sem isto o servidor "dorme" e o crawler recebe timeout.
  maxInstances: 1
```

### 2. `src/middleware.ts` — bypass de bots Google
Os bots `Mediapartners-Google`, `AdsBot-Google`, `Googlebot`, `Chrome-Lighthouse` (PageSpeed) **NUNCA** devem receber redirects.
O middleware deve sempre ter a verificação de User-Agent ANTES de qualquer redirect.

**IMPORTANTE:** A raiz `/` faz `permanentRedirect('/home')` no `page.tsx` — isso é um **308** que os bots não seguem. O middleware interceta bots no `/` e faz um **rewrite** interno para `/home` (sem emitir redirect HTTP):
```ts
const isGoogleBot = GOOGLE_BOT_PATTERNS.some(p => userAgent.includes(p));
if (isGoogleBot) {
  if (pathname === '/') return NextResponse.rewrite(new URL('/home', request.url));
  return NextResponse.next();
}
```
Sem este rewrite, o AdSense e o PageSpeed Insights falham com "site inativo" ou "unable to resolve" ao crawlar a raiz.

### 3. `src/app/robots.ts` — regra explícita Mediapartners-Google
```ts
{ userAgent: 'Mediapartners-Google', allow: '/' }
```

### 4. `public/ads.txt` — não alterar
```
google.com, pub-9018474620860214, DIRECT, f08c47fec0942fa0
```
Qualquer alteração neste ficheiro pode revogar a autorização AdSense.

### 5. `src/app/layout.tsx` — script AdSense via `next/script`
Usar **sempre** `next/script` com `strategy="afterInteractive"`. Nunca usar `<script>` raw no `<head>`.
```tsx
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9018474620860214"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

## Domínios

| Domínio | Uso |
|---|---|
| `demokratia.pt` | Domínio canónico — o que o AdSense conhece |
| `studio--studio-1716481110-b0153.us-central1.hosted.app` | Domínio Firebase interno — redirect para canonical (apenas humanos) |

## Publisher ID
`pub-9018474620860214`

---

## Como fazer Deploy

O projeto usa **Firebase App Hosting** (não Firebase Hosting clássico). Não há `git push` — o deploy é feito directamente via CLI:

```bash
firebase deploy
```

Este comando faz deploy de:
- `apphosting` → build e rollout do Next.js app (pode demorar 2-5 min)
- `firestore` → regras de segurança (`firestore.rules`)

**Não existe remote Git configurado.** O source é enviado directamente para `gs://firebaseapphosting-sources-*` via a CLI.

### Confirmar que o deploy chegou ao ar
Depois do `firebase deploy` terminar com `Rollout for backend studio complete!`, verificar:
- https://demokratia.pt/ (domínio canónico, via custom domain no Firebase)
- https://studio--studio-1716481110-b0153.us-central1.hosted.app (URL interno Firebase — redireciona para o canónico para humanos, mas bots acedem directamente)

### Consola Firebase
https://console.firebase.google.com/project/studio-1716481110-b0153/apphosting

---

## Google Search Console

**Propriedade validada:** `https://demokratia.pt/` (método: ficheiro HTML)

**Ficheiro de verificação:** `public/googlef748ce26d96326d2.html`  
Serve em: `https://demokratia.pt/googlef748ce26d96326d2.html`  
**NÃO remover este ficheiro** — se for apagado, a propriedade perde validação.

Também está no middleware com bypass explícito para nunca ser redirecionado.

### Como usar o Search Console para diagnosticar o AdSense
1. **Inspeção de URL** → cola qualquer URL do site → "Testar URL em tempo real"
   - Mostra o que o Googlebot vê, tempo de resposta, erros de renderização
2. **Cobertura** → mostra páginas indexadas, erros 404, páginas bloqueadas
3. **Core Web Vitals** → performance real medida por utilizadores Chrome

O AdsBot usa infraestrutura similar ao Googlebot. Se o Search Console não mostrar erros, o AdSense também não deve ter problemas de acesso.

---

## Checklist após qualquer deploy que toque em middleware/robots/apphosting

- [ ] `minInstances: 1` presente em `apphosting.yaml`
- [ ] Bypass de Google bots no topo do middleware
- [ ] `ads.txt` intacto em `public/ads.txt`
- [ ] `Mediapartners-Google` em `robots.ts`
- [ ] Script AdSense via `next/script` em `layout.tsx`
- [ ] `public/googlef748ce26d96326d2.html` intacto (verificação Search Console)
