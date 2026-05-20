/**
 * data-cache.ts — Cache persistente universal para dados externos.
 *
 * PADRÃO ÚNICO: Stale-While-Revalidate com Cloudflare KV.
 *
 *   1. Tem dados no KV? → devolve IMEDIATAMENTE (mesmo que expirados/stale)
 *      Se o TTL expirou: dispara refresh em BACKGROUND sem bloquear o utilizador.
 *   2. Sem dados (primeira vez)? → fetch síncrono → guarda → devolve.
 *   3. API em baixo? → usa fallback estático → guarda com TTL×2 → devolve.
 *
 * KV namespace: binding `KV`, prefix `cache:`
 *
 * Aplica-se a TODAS as fontes: cotações, notícias, inflação, municípios, parlamento.
 */

import { getKV } from './db';

// ─── Configuração de TTL por tipo de dado ────────────────────────────────────
// Baseado na frequência real de publicação de cada fonte.

export const DATA_CACHE_CONFIG = {
  // ── Mercados financeiros ──────────────────────────────────────────────────
  /** Alpha Vantage: plano gratuito (25 pedidos/dia). 15 min equilibra frescura e quota. */
  quotes: {
    ttlSeconds: 900,
    label: 'Cotações de Bolsa',
    source: 'Alpha Vantage',
    updateFrequency: 'Cada 15 minutos',
    rationale: 'Plano gratuito: 25 calls/dia. 15 min garante dados úteis sem esgotar quota.',
  },
  /** Alpha Vantage News Sentiment: publicações ao longo do dia. 15 min suficiente. */
  news: {
    ttlSeconds: 900,
    label: 'Notícias Financeiras',
    source: 'Alpha Vantage News Sentiment',
    updateFrequency: 'Cada 15 minutos',
    rationale: 'Notícias publicadas continuamente; 15 min garante relevância sem esgotar quota.',
  },

  // ── Macro-economia ────────────────────────────────────────────────────────
  /** Eurostat IHPC: publicado mensalmente (última sexta-feira do mês). */
  inflation: {
    ttlSeconds: 43200,
    label: 'Inflação / IHPC (Eurostat)',
    source: 'Eurostat API prc_hicp_manr',
    updateFrequency: 'Cada 12 horas',
    rationale: 'Dados mensais do Eurostat. 12h garante que apanhamos a publicação no próprio dia.',
  },

  // ── Municípios e administração pública ───────────────────────────────────
  /** BASE.gov: contratos novos publicados diariamente. 30 min é suficiente. */
  contratos: {
    ttlSeconds: 1800,
    label: 'Contratos Públicos (BASE)',
    source: 'base.gov.pt',
    updateFrequency: 'Cada 30 minutos',
    rationale: 'Novos contratos são publicados continuamente. 30 min equilibra frescura e custo de chamadas.',
  },
  /** RASI: publicado anualmente (março/abril). Cache semanal é mais que suficiente. */
  criminalidade: {
    ttlSeconds: 604800,
    label: 'Crime / RASI (DGPJ)',
    source: 'dados.gov.pt / RASI',
    updateFrequency: 'Cada 7 dias',
    rationale: 'Dados anuais do RASI. A fonte é actualizada 1x/ano; 7 dias é conservador.',
  },
  /** SNS Transparência: indicadores publicados mensalmente. 24h é prudente. */
  saude: {
    ttlSeconds: 86400,
    label: 'Saúde (SNS Transparência)',
    source: 'transparencia.sns.gov.pt',
    updateFrequency: 'Cada 24 horas',
    rationale: 'Dados sazonais/mensais do SNS. 24h garante frescura sem pressionar a API.',
  },

  // ── Parlamento ────────────────────────────────────────────────────────────
  /** AR: composição muda apenas em eleições (a cada ~4 anos). 24h é mais que suficiente. */
  deputados: {
    ttlSeconds: 86400,
    label: 'Deputados / Composição AR',
    source: 'parlamento.pt',
    updateFrequency: 'Cada 24 horas',
    rationale: 'Composição estável por legislatura (4 anos). 24h é conservador e suficiente.',
  },
  /** AR: iniciativas apresentadas em sessões parlamentares semanais. 1h é adequado. */
  iniciativas: {
    ttlSeconds: 3600,
    label: 'Iniciativas Legislativas (AR)',
    source: 'parlamento.pt',
    updateFrequency: 'Cada 1 hora',
    rationale: 'Actividade parlamentar em tempo de sessão. 1h oferece dados razoavelmente actuais.',
  },
} as const;

export type DataType = keyof typeof DATA_CACHE_CONFIG;

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CacheEntry<T = unknown> {
  key: string;
  dataType: DataType;
  data: T;
  fetchedAt: number;  // Unix ms
  ttlSeconds: number;
  sourceUrl: string;
  status: 'ok' | 'fallback' | 'error';
  errorMsg?: string;
  expiresAt: number;  // Unix ms
}

export interface CacheResult<T> {
  data: T;
  stale: boolean;        // true se serve dados expirados (refresh em background)
  fromCache: boolean;    // true se veio do Firestore
  cacheStatus: CacheEntry['status'];
}

export interface CacheStatus {
  key: string;
  dataType: DataType;
  label: string;
  status: 'ok' | 'fallback' | 'error' | 'missing';
  fetchedAt: Date | null;
  expiresAt: Date | null;
  isExpired: boolean;
  updateFrequency: string;
  errorMsg?: string;
}

const KV_PREFIX = 'cache:';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isExpired(entry: CacheEntry): boolean {
  return Date.now() > entry.expiresAt;
}

function buildEntry<T>(
  key: string,
  dataType: DataType,
  sourceUrl: string,
  data: T,
  status: 'ok' | 'fallback' | 'error',
  errorMsg?: string,
  ttlMultiplier = 1,
): CacheEntry<T> {
  const ttlSeconds = DATA_CACHE_CONFIG[dataType].ttlSeconds * ttlMultiplier;
  const now = Date.now();
  return {
    key,
    dataType,
    data,
    fetchedAt: now,
    ttlSeconds,
    sourceUrl,
    status,
    expiresAt: now + ttlSeconds * 1000,
    ...(errorMsg ? { errorMsg } : {}),
  };
}

async function kvGet<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    return await getKV().get<CacheEntry<T>>(KV_PREFIX + key, 'json');
  } catch {
    return null;
  }
}

async function kvPut<T>(key: string, entry: CacheEntry<T>): Promise<void> {
  try {
    await getKV().put(KV_PREFIX + key, JSON.stringify(entry));
  } catch {
    // KV write failure is non-fatal — app continues serving data
  }
}

// ─── Background refresh ───────────────────────────────────────────────────────
// Fire-and-forget. Funciona porque minInstances:1 mantém o processo Node.js vivo.

function triggerBackgroundRefresh<T>(
  key: string,
  dataType: DataType,
  sourceUrl: string,
  fetcher: () => Promise<T>,
  fallback: () => T | Promise<T>,
): void {
  Promise.resolve().then(async () => {
    try {
      const data = await fetcher();
      const entry = buildEntry(key, dataType, sourceUrl, data, 'ok');
      await kvPut(key, entry);
    } catch (err) {
      try {
        const data = await fallback();
        const errMsg = err instanceof Error ? err.message : String(err);
        const entry = buildEntry(key, dataType, sourceUrl, data, 'fallback', errMsg, 2);
        await kvPut(key, entry);
      } catch {
        // Se mesmo o fallback falhar, mantemos o cache anterior.
      }
    }
  }).catch(() => {});
}

// ─── API Principal: Stale-While-Revalidate ────────────────────────────────────

/**
 * getWithSWR — Padrão universal para TODAS as fontes de dados.
 *
 *   1. Tem dados Firestore?  → devolve IMEDIATAMENTE
 *      TTL expirou?          → dispara refresh em background (sem bloquear)
 *   2. Sem dados (1ª vez)?   → fetch síncrono → devolve
 *   3. Fetch falha?          → fallback estático → devolve
 */
export async function getWithSWR<T>(
  key: string,
  dataType: DataType,
  fetcher: () => Promise<T>,
  fallback: () => T | Promise<T>,
  sourceUrl = '',
): Promise<CacheResult<T>> {
  // Passo 1 — ler KV
  const entry = await kvGet<T>(key);
  if (entry) {
    const stale = isExpired(entry);
    if (stale) {
      triggerBackgroundRefresh(key, dataType, sourceUrl, fetcher, fallback);
    }
    return { data: entry.data, stale, fromCache: true, cacheStatus: entry.status };
  }

  // Passo 2 — primeira vez → fetch síncrono
  try {
    const data = await fetcher();
    const newEntry = buildEntry(key, dataType, sourceUrl, data, 'ok');
    kvPut(key, newEntry).catch(() => {});
    return { data, stale: false, fromCache: false, cacheStatus: 'ok' };
  } catch (err) {
    const data = await fallback();
    const errMsg = err instanceof Error ? err.message : String(err);
    const newEntry = buildEntry(key, dataType, sourceUrl, data, 'fallback', errMsg, 2);
    kvPut(key, newEntry).catch(() => {});
    return { data, stale: false, fromCache: false, cacheStatus: 'fallback' };
  }
}

/**
 * getCached — Alias de compatibilidade com código anterior.
 * Mantém a assinatura antiga (inclui sourceUrl) mas chama getWithSWR.
 *
 * @deprecated Usar getWithSWR directamente em código novo.
 */
export async function getCached<T>(
  key: string,
  dataType: DataType,
  sourceUrl: string,
  fetcher: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<{ data: T; fromCache: boolean; cacheStatus: 'ok' | 'fallback' | 'error' }> {
  const result = await getWithSWR(key, dataType, fetcher, fallback, sourceUrl);
  return { data: result.data, fromCache: result.fromCache, cacheStatus: result.cacheStatus };
}

/**
 * Força actualização imediata, ignorando TTL.
 * Usado pelo painel de administração ("Actualizar agora").
 */
export async function forceRefresh<T>(
  key: string,
  dataType: DataType,
  sourceUrl: string,
  fetcher: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<{ data: T; status: 'ok' | 'fallback' }> {
  try {
    const data = await fetcher();
    const entry = buildEntry(key, dataType, sourceUrl, data, 'ok');
    await kvPut(key, entry);
    return { data, status: 'ok' };
  } catch (err) {
    const data = await fallback();
    const errMsg = err instanceof Error ? err.message : String(err);
    const entry = buildEntry(key, dataType, sourceUrl, data, 'fallback', errMsg, 2);
    await kvPut(key, entry);
    return { data, status: 'fallback' };
  }
}

/**
 * Lista o estado de todas as entradas de cache — para o painel admin.
 */
export async function getAllCacheStatuses(): Promise<CacheStatus[]> {
  // Fetch each known key from KV in parallel
  const keys = Object.keys(DATA_CACHE_CONFIG) as DataType[];
  const entries = await Promise.all(
    keys.map(async k => ({ key: k, entry: await kvGet(k) }))
  );

  return entries.map(({ key: type, entry }) => {
    const cfg = DATA_CACHE_CONFIG[type as DataType];
    if (!entry) {
      return {
        key: type,
        dataType: type as DataType,
        label: cfg.label,
        status: 'missing' as const,
        fetchedAt: null,
        expiresAt: null,
        isExpired: true,
        updateFrequency: cfg.updateFrequency,
      };
    }
    return {
      key: (entry as CacheEntry).key,
      dataType: (entry as CacheEntry).dataType,
      label: cfg.label,
      status: (entry as CacheEntry).status,
      fetchedAt: new Date((entry as CacheEntry).fetchedAt),
      expiresAt: new Date((entry as CacheEntry).expiresAt),
      isExpired: isExpired(entry as CacheEntry),
      updateFrequency: cfg.updateFrequency,
      errorMsg: (entry as CacheEntry).errorMsg,
    };
  });
}
