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
Os bots `Mediapartners-Google`, `AdsBot-Google`, `Googlebot` **NUNCA** devem receber redirects.
O middleware deve sempre ter a verificação de User-Agent ANTES de qualquer redirect:
```ts
const isGoogleBot = GOOGLE_BOT_PATTERNS.some(p => userAgent.includes(p));
if (isGoogleBot) return NextResponse.next();
```

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

## Checklist após qualquer deploy que toque em middleware/robots/apphosting

- [ ] `minInstances: 1` presente em `apphosting.yaml`
- [ ] Bypass de Google bots no topo do middleware
- [ ] `ads.txt` intacto em `public/ads.txt`
- [ ] `Mediapartners-Google` em `robots.ts`
- [ ] Script AdSense via `next/script` em `layout.tsx`
