# Demokratia Portugal — Arquitectura

## Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Hosting / Edge | Cloudflare Pages + Workers |
| Base de dados | Cloudflare D1 (SQLite distribuído) |
| KV / Cache | Cloudflare KV |
| Autenticação | Clerk v7 |
| IA / LLM | Google Gemini via Genkit (`@genkit-ai/google-genai`) |
| UI | Tailwind CSS + shadcn/ui + Recharts |
| Linguagem | TypeScript 5 |

---

## Funcionalidades Principais

- **Simulador Económico** — variáveis políticas hipotéticas → impacto simulado (PIB, desemprego, inflação, dívida)
- **Explorador de Dados** — consulta em linguagem natural a dados públicos portugueses via IA + visualizações
- **Verificador de Factos** — fact-checking com cache público e histórico por utilizador
- **Legislação** — consulta a legislação portuguesa com resposta em linguagem natural
- **Cenários Públicos** — guardar e partilhar simulações com outros utilizadores
- **Perfil / Finanças** — orçamento pessoal, inflação, simulação IRS — dados privados por utilizador
- **Painel de Administração** — gestão de fontes de dados, mensagens, refutações, seeding

---

## Arquitetura de Dados

### Princípio Base
**Zero Firebase.** Toda a persistência usa Cloudflare D1 via API REST interna (`/api/data/[collection]`).

### Hooks de Dados (cliente)

```typescript
// Leitura de colecção (polling 10s por defeito)
const { data, isLoading } = useCollection<T>('collection', params?, pollMs?)

// Leitura de documento único
const { data, isLoading } = useDoc<T>('collection', id)

// Escrita
await dbSet('collection', id, data)   // upsert
await dbAdd('collection', data)        // insert com ID automático
await dbUpdate('collection', id, data) // patch parcial
await dbDelete('collection', id)       // eliminar
```

### Mapeamento de Colecções

| Colecção (D1) | Descrição |
|---------------|-----------|
| `users` | Perfis de utilizador |
| `user_budgetConfig` | Configuração orçamental mensal por utilizador |
| `user_movements` | Movimentos financeiros por utilizador |
| `user_factChecks` | Histórico de fact-checks por utilizador |
| `user_legislationQueries` | Histórico de consultas legislativas |
| `user_savedViews` | Vistas guardadas no Explorador |
| `simulations` | Simulações (públicas e privadas) |
| `publicScenarios` | Cenários macroeconómicos partilhados |
| `publicFactChecks` | Cache pública de fact-checks |
| `publicStatisticQueries` | Cache pública de queries do Explorador de IA |
| `publicLegislationQueries` | Cache pública de consultas legislativas |
| `statisticalData` | Dados estatísticos para o Explorador |
| `dataSources` | Fontes de dados registadas |
| `contactMessages` | Mensagens de contacto |
| `refutations` | Refutações submetidas por utilizadores |
| `roles_admin` | Roles de administrador |

### Importação de `@/firebase` (barrel central)

```typescript
import {
  // Auth
  useUser, useAuth,
  // Leitura
  useCollection, useDoc,
  // Escrita
  dbAdd, dbSet, dbUpdate, dbDelete, nowTs,
  // Erros
  errorEmitter, FirestorePermissionError,
} from '@/firebase';
```

---

## Autenticação (Clerk v7)

- `useUser()` → `{ user: AppUser | null, isUserLoading, isAdmin }`
- `AppUser` tem: `uid`, `email`, `displayName`, `photoURL`
- Google OAuth via `clerk.client.signIn.authenticateWithRedirect({ strategy: 'oauth_google' })`
- Protecção de rotas via `src/middleware.ts` (Clerk `clerkMiddleware`)

---

## Inteligência Artificial

- **Motor**: Google Gemini (via Genkit `@genkit-ai/google-genai`)
- **Usado em**: fact-check, consulta legislativa, explorador de dados, análise de cenários, tradução
- **Nunca usado para**: actualização de dados de fontes públicas (HTTP puro)

---

## Padrões de Desenvolvimento

### Internacionalização (i18n)
```typescript
import { useTranslation } from '@/lib/i18n';
const { t, language } = useTranslation();
```
Idiomas suportados: `pt` (padrão) e `en`.

### Cache de Traduções
Cache em memória por módulo (não persistida), chave `${texto}:en`:
```typescript
const translationCache = new Map<string, string>();
```

### Timestamps
```typescript
import { nowTs } from '@/firebase';
nowTs() // → Date.now() (unix ms)
```

---

## Política de Dados Externos

### Categorias e Frequência

| Categoria | Fonte | Frequência | Estratégia |
|-----------|-------|-----------|------------|
| Dados estruturais (Censos) | INE | Decenal | JSON estático |
| Crime (RASI) | DGPJ / MAI | Anual (março/abril) | JSON estático, atualizar manualmente |
| Saúde (SNS) | transparencia.sns.gov.pt | Mensal | ISR 24h |
| Contratos públicos | base.gov.pt | Contínuo | ISR 30min |
| Deputados / Composição AR | parlamento.pt | Por legislatura | Cache in-memory 1h |
| Iniciativas legislativas | parlamento.pt | Semanal | ISR 1h |
| IRS (tabelas) | AT / OE | Anual | JSON estático |
| Cotações | Alpha Vantage | 15min (cache) | KV Cloudflare |
| Inflação | Eurostat HICP | Mensal | ISR 24h |

### Cadeia de Fallback (3 camadas)
```
1. API live (fetch + Cache-Control)
       ↓
2. Dados.gov.pt / mirror oficial
       ↓
3. JSON estático embebido no build
```

---

## Estrutura de Ficheiros Relevante

```
src/
  firebase/
    index.ts          ← barrel: auth + hooks + db helpers
    error-emitter.ts  ← evento broadcaster (FirestorePermissionError)
  providers/
    auth-provider.tsx ← Clerk → AppUser interface
  hooks/
    use-collection.tsx ← polling hook (GET /api/data/[col])
    use-doc.tsx        ← polling hook (GET /api/data/[col]/[id])
  lib/
    db-client.ts       ← dbAdd/dbSet/dbUpdate/dbDelete/nowTs
    db.ts              ← server-side D1 helper (getRequestContext)
    actions.ts         ← Genkit server actions (AI)
  app/
    api/data/          ← REST endpoint para D1
    api/admin/         ← endpoints admin (cache, etc.)
```


- Simulador Económico Data-Driven: Uma ferramenta que permite aos utilizadores introduzir variáveis políticas hipotéticas e visualizar o seu impacto económico simulado, utilizando dados reais de fontes portuguesas e internacionais. A ferramenta usa raciocínio para decidir quando ou se deve incorporar informações no resultado.
- Explorador de Dados Públicos: Uma interface intuitiva para explorar e compreender dados económicos e sociais em tempo real.
- Perfil de Utilizador e Definições: Funcionalidades básicas de gestão de utilizadores, incluindo criação de perfil, ajustes de definições e autenticação segura.

## Estratégia de Integração de Dados (Plano de Ação Revisto):

O objetivo é construir um sistema de dados resiliente e abrangente, utilizando múltiplas fontes de API para evitar os limites de uma única fonte e garantir a melhor qualidade de dados para cada categoria.

**Arquitetura de Dados Inteligente:**

A aplicação irá priorizar fontes de API sempre que possível, recorrendo ao scraping de websites como um fallback robusto. Esta abordagem híbrida garante a continuidade dos dados mesmo quando as APIs falham ou atingem os seus limites.

- **Fontes Primárias:** APIs (Alpha Vantage, Financial Modeling Prep, etc.)
- **Fontes Secundárias:** Web Scraping (Pordata, INE, etc.)
- **Mecanismo de Fallback:** Se uma chamada de API falhar, o sistema tentará automaticamente obter os dados através de scraping do website correspondente.

## Padrões de Desenvolvimento Frontend

### Internacionalização (i18n)

Para garantir a consistência e a correta configuração em todo o projeto, todos os componentes React que necessitem de tradução de texto **devem** obrigatoriamente utilizar o hook `useTranslation` proveniente do módulo de i18n local. A importação correta é:

`import { useTranslation } from '@/lib/i18n';`

A importação direta da biblioteca `react-i18next` é estritamente desaconselhada para evitar inconsistências e possíveis erros de configuração.


---

## Estratégia de Atualização de Dados (Data Freshness Policy)

### Princípio Base
**Zero consumo de IA para atualização de dados.** Todos os dados externos são obtidos via HTTP puro (fetch → parse → cache). A IA (Genkit/Google AI) é usada apenas em funcionalidades explícitas de análise/geração de texto — nunca para atualizar dados de fontes públicas.

### Categorias de Dados e Política de Cache

| Categoria | Fonte | Frequência | Estratégia |
|-----------|-------|-----------|------------|
| Dados estruturais (Censos) | INE | Decenal | JSON estático no código |
| Crime (RASI) | DGPJ / MAI | Anual (março/abril) | JSON estático, atualizar manualmente |
| Saúde (SNS) | transparencia.sns.gov.pt | Mensal | revalidate: 86400 (ISR 24h) |
| Contratos públicos | base.gov.pt | Contínuo | revalidate: 1800 (ISR 30min) |
| Deputados / Composição AR | parlamento.pt | Por legislatura | Cache in-memory 1h + fallback XVI leg. |
| Iniciativas legislativas | parlamento.pt | Semanal | revalidate: 3600 (ISR 1h) |
| IRS (tabelas) | AT / OE | Anual | JSON estático no código |

### Mecanismo de 3 Camadas (Fallback Chain)

```
1. Live API (HTTP fetch com Cache-Control)
       ↓ (se falhar ou vazio)
2. dados.gov.pt proxy / mirror oficial
       ↓ (se não disponível)
3. Dados estáticos curados (embarque no build, baseados em última publicação oficial)
```

### Next.js ISR (Stale-While-Revalidate Automático)

- Utilizadores veem sempre dados imediatamente (sem loading)
- Atualização acontece em background quando cache expira
- Não requer Cloud Functions nem jobs externos para a maioria das fontes

### Atualização Manual (Dados Anuais)

Para fontes que publicam anualmente (RASI, INE Censos, tabelas IRS):
1. Verificar publicação oficial (normalmente Q1 de cada ano)
2. Atualizar os arrays de fallback nos ficheiros `*-api.ts` correspondentes
3. `git commit` + deploy — sem downtime, zero custo extra

### Monitorização (Futuro Opcional)

- Firebase Scheduled Function a pré-aquecer caches críticos às 04:00 diariamente
- Alert se API primária retornar erro por mais de 24h consecutivas
- Custo estimado: < €1/mês para o conjunto atual de fontes
