# Estratégia de Crescimento — Demokratia.pt

Documento de referência com todas as acções recomendadas para aumentar o tráfego orgânico e maximizar a aprovação do Google AdSense.

**Data de criação:** Abril 2026  
**Contexto:** Site tecnicamente funcional e acessível. Problema de acessibilidade para bots (308 permanente) resolvido. AdSense aguarda nova revisão após período de espera obrigatório.

---

## 1. Antes de Submeter para Revisão do AdSense

**Regra de ouro:** Não submeter no primeiro dia disponível após o período de espera. Deixar o tráfego crescer alguns dias antes. O AdSense regista um padrão de rejeições repetidas que pode penalizar futuras candidaturas.

### Checklist técnica (já resolvida ✅)
- ✅ Site retorna HTTP 200 para bots (AdsBot-Google, Mediapartners-Google)
- ✅ Conteúdo HTML visível sem JavaScript (SSR do Next.js)
- ✅ `ads.txt` acessível em `/ads.txt`
- ✅ Sem redirects permanentes (308) na raiz
- ✅ CLS reduzido (AdBanner com altura fixa reservada)
- ✅ Google Search Console validado

### Antes de submeter, verificar:
1. Ir a [Google Search Console](https://search.google.com/search-console) → Cobertura → confirmar que as páginas principais estão indexadas
2. Verificar que o AdSense tag está no `<head>` de todas as páginas (já está em `layout.tsx`)
3. Confirmar que `ads.txt` contém: `google.com, pub-9018474620860214, DIRECT, f08c47fec0942fa0`

---

## 2. Google Search Console — Acções Imediatas

O Search Console é a ferramenta mais importante para crescimento orgânico. Usar regularmente.

### 2.1 Solicitar Re-indexação das Páginas Principais

1. Ir a [search.google.com/search-console](https://search.google.com/search-console)
2. Seleccionar propriedade `demokratia.pt`
3. Menu lateral → **Inspecção de URL**
4. Inserir cada URL abaixo e clicar em **"Solicitar indexação"**:

Prioridade alta (solicitar primeiro):
```
https://demokratia.pt/home
https://demokratia.pt/irs
https://demokratia.pt/fact-check
https://demokratia.pt/legislation
https://demokratia.pt/map
https://demokratia.pt/budget
```

Prioridade média:
```
https://demokratia.pt/inflation
https://demokratia.pt/simulations
https://demokratia.pt/scenarios
https://demokratia.pt/library
https://demokratia.pt/about
https://demokratia.pt/methodology
```

### 2.2 Verificar Core Web Vitals

1. Search Console → **Experiência** → **Core Web Vitals**
2. Confirmar que CLS está abaixo de 0.1 após deploy de Abril 2026
3. Se LCP > 2.5s: reportar e investigar (já esperado dado ser client-side)

### 2.3 Monitorizar Queries de Pesquisa

1. Search Console → **Desempenho** → **Resultados de pesquisa**
2. Identificar queries com impressões mas CTR baixo (posição 4-10)
3. Optimizar o título e descrição das páginas correspondentes para essas queries

---

## 3. Reddit — Estratégia de Publicação

O Reddit é o fórum online mais relevante para alcançar portugueses online. **Não é spam** se o conteúdo for genuíno e útil.

### 3.1 Subreddits Alvo

| Subreddit | Membros (aprox.) | Tema | Conteúdo ideal |
|-----------|-----------------|------|----------------|
| [r/portugal](https://reddit.com/r/portugal) | ~250k | Portugal geral | Qualquer análise relevante |
| [r/financaspessoais](https://reddit.com/r/financaspessoais) | ~40k | Finanças pessoais PT | Simulador IRS, inflação, investimento |
| [r/portugal_dev](https://reddit.com/r/portugal_dev) | ~15k | Tech PT | Aspecto open-source do projeto |
| [r/economia](https://reddit.com/r/economia) | Variável | Economia PT/BR | Análises económicas |

### 3.2 Regras para Não Ser Banido

- **Não publicar links directos imediatamente.** Criar conta, participar em discussões existentes durante 1-2 semanas antes de publicar conteúdo próprio.
- **Ratio mínimo:** Por cada post próprio, comentar em 5-10 posts alheios.
- **Tom:** Nunca "vendam" o site. Apresentar como ferramenta útil, mencionar que é open-source e gratuito.
- **Transparência:** Se perguntarem se é o criador, confirmar. O Reddit penaliza quem esconde conflitos de interesse.

### 3.3 Templates de Posts por Ferramenta

**Para o Simulador IRS (r/financaspessoais):**
```
Título: Fiz um simulador de IRS gratuito e open-source para Portugal

Texto: Olá a todos,

Trabalho como [profissão] e fartei-me de não conseguir perceber exactamente 
quanto pago de IRS e porquê. Construí o Demokratia.pt, uma plataforma 
open-source com simuladores económicos para Portugal.

A funcionalidade de IRS permite:
- Calcular o imposto líquido com base no rendimento bruto
- Ver a taxa efectiva vs taxa marginal
- Comparar diferentes escalões

[Link: demokratia.pt/irs]

Está em versão beta, feedback bem-vindo. Código disponível se alguém 
quiser contribuir.
```

**Para o Mapa Regional (r/portugal):**
```
Título: Visualizei as assimetrias regionais de Portugal num mapa interactivo

Texto: Fiz um mapa com dados do INE que mostra indicadores socioeconómicos 
por região (salário médio, desemprego, população, etc.). 

É possível comparar concelhos e ver a evolução ao longo do tempo.

[Link: demokratia.pt/map]

Ficam impressionados com as diferenças entre interior e litoral.
```

**Para o Fact-Check (r/portugal):**
```
Título: Criei uma ferramenta de fact-check de declarações políticas com IA

Texto: Sempre que um político faz uma afirmação sobre economia ou estatísticas, 
podes verificar se é verdade com fontes oficiais (INE, Eurostat, Banco de Portugal).

[Link: demokratia.pt/fact-check]

Open-source, sem publicidade intrusiva, sem partisanismo.
```

### 3.4 Timing

- Melhor hora para publicar em r/portugal: **Terça a Quinta, entre 19h-22h (hora de Lisboa)**
- Evitar sextas e fins-de-semana (menos engagement)
- Espaçar posts por pelo menos 2 semanas por subreddit

---

## 4. Backlinks — Diretórios e Comunidades

Backlinks de qualidade sinalizam à Google que o site é legítimo e aumentam o PageRank.

### 4.1 Diretórios Portugueses

Submeter o site nos seguintes diretórios (gratuitos):

| Diretório | URL | Categoria sugerida |
|-----------|-----|-------------------|
| SAPO | sapo.pt | Política / Tecnologia |
| Portugal.com | portugal.com | Serviços / Ferramentas |
| Netlog.pt | netlog.pt | Tecnologia |
| Marcadores.pt | marcadores.pt | Política / Economia |

**Como submeter:** A maioria tem um formulário "Adicionar site" ou "Sugerir link". Usar sempre:
- **Título:** Demokratia — Dados Políticos e Económicos de Portugal
- **Descrição:** Plataforma open-source com simuladores de políticas públicas, dados do INE e Eurostat, fact-check de declarações políticas e análise económica para Portugal.
- **Categoria:** Política / Economia / Tecnologia

### 4.2 GitHub

Se o código for público (ou se tornar público):
1. Criar repositório no GitHub com README detalhado
2. Adicionar o link `demokratia.pt` na descrição do repo
3. Um repositório GitHub com estrelas é um backlink de alta qualidade (DA altíssimo)

### 4.3 Product Hunt

[Product Hunt](https://www.producthunt.com) é uma plataforma de lançamento de produtos digitais. Um lançamento bem feito pode gerar centenas de visitas em 24h.

**Como fazer um lançamento:**
1. Criar conta com pelo menos 2 semanas de antecedência
2. Preparar materiais:
   - Logo (já existe)
   - Descrição curta (60 chars): "Plataforma open-source de dados políticos e económicos de Portugal"
   - Tagline (240 chars): explicar o valor
   - Screenshots (5-7): homepage, simulador IRS, mapa, fact-check
   - GIF/vídeo demo (opcional mas aumenta muito o engagement)
3. Lançar numa **Terça ou Quarta** (dias com mais tráfego no PH)
4. Avisar amigos/comunidade para votarem no dia do lançamento

### 4.4 Hacker News

[Hacker News](https://news.ycombinator.com) tem secção "Show HN:" para projectos pessoais.

**Formato:** `Show HN: Demokratia – Open-source civic data platform for Portugal`

Regra: só publicar quando o produto estiver polido. HN é exigente e crítica construtivamente.

---

## 5. SEO On-Page — Melhorias Recomendadas

### 5.1 Meta Descriptions Específicas por Página

Actualmente todas as páginas herdam a mesma meta description do `layout.tsx`. Adicionar meta descriptions específicas nas páginas principais:

```tsx
// Exemplo para /irs/page.tsx
export const metadata = {
  title: 'Simulador IRS Portugal 2025 | Demokratia',
  description: 'Calcula o teu IRS de forma simples e gratuita. Simulador actualizado com os escalões de 2025, taxa efectiva, deduções e comparação por rendimento.',
};
```

Páginas prioritárias para adicionar metadata específica:
- `/irs` — "Simulador IRS Portugal 2025"
- `/inflation` — "Calculadora de Inflação Real Portugal"
- `/fact-check` — "Fact-Check de Declarações Políticas Portugal"
- `/map` — "Mapa Económico e Social de Portugal por Concelhos"
- `/budget` — "Simulador de Orçamento Familiar Portugal"

### 5.2 Structured Data (Schema.org)

Adicionar JSON-LD ao `layout.tsx` para melhorar a apresentação nos resultados de pesquisa:

```tsx
// Em src/app/layout.tsx, dentro do <head>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Demokratia Portugal",
      "url": "https://demokratia.pt",
      "description": "Plataforma open-source de dados políticos e económicos de Portugal",
      "applicationCategory": "GovernmentApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "author": {
        "@type": "Organization",
        "name": "Demokratia"
      }
    })
  }}
/>
```

### 5.3 Sitemap — Verificar Cobertura

Confirmar que o sitemap em `/sitemap.xml` inclui todas as páginas estáticas relevantes e está actualizado. O Google usa o sitemap para descobrir páginas novas.

---

## 6. Redes Sociais — Presença Mínima

O AdSense e o Google Search valorizam sinais sociais. Criar pelo menos:

### 6.1 Twitter/X
- Handle sugerido: `@demokratia_pt`
- Publicar 1-2 análises por semana (pode ser thread com dados do simulador IRS, comparações regionais, etc.)
- Seguir jornalistas e comentadores de economia portugueses

### 6.2 LinkedIn
- Criar página da empresa "Demokratia"
- Partilhar análises relevantes — o LinkedIn tem boa distribuição orgânica para conteúdo de política económica

### 6.3 Bluesky
- Rede social em crescimento, popular em Portugal
- Handle: `demokratia.pt` (podem usar o domínio como handle verificado)

---

## 7. Monitorização e KPIs

### 7.1 Métricas a Seguir

| Métrica | Ferramenta | Objectivo 3 meses |
|---------|-----------|-------------------|
| Utilizadores únicos/mês | Google Analytics / Search Console | > 500 |
| Cliques orgânicos/mês | Search Console | > 200 |
| Páginas indexadas | Search Console | > 20 |
| PageSpeed Score | PageSpeed Insights | > 60 mobile |
| CLS | PageSpeed Insights | < 0.1 |

### 7.2 Dashboard Mínimo

Configurar o Google Analytics 4 (se não estiver):
1. Criar propriedade GA4 em analytics.google.com
2. Adicionar a tag `NEXT_PUBLIC_GA_ID` ao `apphosting.yaml`
3. Criar script de inicialização em `layout.tsx`

Isto permite ver de onde vêm os utilizadores, quais páginas visitam e quanto tempo ficam.

---

## 8. Plano de Acção por Semana

### Semana 1 (imediato)
- [ ] Solicitar re-indexação no Search Console para 6 páginas principais
- [ ] Criar conta no Reddit (se não existir) e começar a participar organicamente
- [ ] Submeter site ao diretório SAPO e Marcadores.pt

### Semana 2
- [ ] Publicar primeiro post no r/financaspessoais sobre o simulador IRS
- [ ] Adicionar metadata específica às páginas /irs e /map
- [ ] Criar conta Twitter/X @demokratia_pt

### Semana 3
- [ ] Publicar no r/portugal sobre o mapa regional
- [ ] Submeter a outros diretórios portugueses
- [ ] Verificar Search Console: novas indexações, queries emergentes

### Semana 4+ (quando o tráfego crescer)
- [ ] Submeter novamente para revisão do AdSense
- [ ] Preparar lançamento no Product Hunt
- [ ] Adicionar Structured Data ao layout

---

## 9. Notas Técnicas para Referência

### Estado Actual do Site (Abril 2026)
- **HTTP responses:** `/` → 302 → `/home` → 200 ✅
- **AdsBot-Google em `/home`:** 200 com conteúdo HTML completo ✅
- **CLS:** Reduzido com AdBanner de altura fixa (290px) ✅
- **AdSense tag:** Presente em todas as páginas via `layout.tsx` ✅
- **ads.txt:** Acessível em `demokratia.pt/ads.txt` ✅
- **Search Console:** Validado com ficheiro `googlef748ce26d96326d2.html` ✅

### Problemas Conhecidos e Resolvidos
1. **308 CDN cache** — `permanentRedirect()` no `page.tsx` foi removido. Nunca usar `permanentRedirect()` na raiz.
2. **Bot detection case-sensitive** — Padrões de UA em minúsculas no middleware.
3. **CLS=1** — Causado por `AdBanner` sem altura reservada e `popularProposals` aparecendo sem skeleton. Ambos corrigidos.
4. **Inflation page sidebar bug** — `budgetDocRef` não memoizado causava re-render infinito. Corrigido com `useMemo`.

### Ficheiros Críticos para AdSense
- `src/app/layout.tsx` — contém o script do AdSense
- `src/components/AdBanner.tsx` — componente de anúncios
- `public/ads.txt` — publisher ID verification
- `src/middleware.ts` — bypass de bots (não tocar sem testar)
- `ADSENSE_RULES.md` — regras detalhadas para não regredir
