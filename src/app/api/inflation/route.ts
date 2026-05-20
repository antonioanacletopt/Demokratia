/**
 * GET /api/inflation
 *
 * Dados de inflação IHPC via Eurostat.
 * Cache Firestore com padrão SWR: TTL 12h, serve imediatamente e refresca em background.
 */
import { NextResponse } from 'next/server';
import { getWithSWR } from '@/lib/data-cache';
import { BASELINE_DATA, EUROSTAT_COICOPS, type InflationData } from '@/lib/inflation-data';

const EUROSTAT_URL_BASE =
  'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_manr';

async function fetchEurostatInflation(): Promise<InflationData> {
  const coicopParams = EUROSTAT_COICOPS.map(c => `coicop=${c}`).join('&');
  const url = `${EUROSTAT_URL_BASE}?format=JSON&lang=en&geo=PT&unit=RCH_A&${coicopParams}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Eurostat HTTP ${response.status}`);

  const json = await response.json() as any;
  const timeDim = json.dimension?.TIME_PERIOD?.category;
  const coicopDim = json.dimension?.coicop?.category;
  if (!timeDim || !coicopDim) throw new Error('Estrutura inesperada da resposta Eurostat');

  const timeKeys: string[] = Object.keys(timeDim.index).sort();
  const N = timeKeys.length;
  const values: (number | null)[] = json.value;
  const rates: Record<string, number> = {};
  let latestPeriod = '';

  for (const coicop of EUROSTAT_COICOPS) {
    const coicopIdx: number | undefined = coicopDim.index[coicop];
    if (coicopIdx === undefined) continue;
    for (let t = N - 1; t >= 0; t--) {
      const val = values[coicopIdx * N + t];
      if (val !== null && val !== undefined) {
        rates[coicop] = val;
        if (coicop === 'CP00') latestPeriod = timeKeys[t];
        break;
      }
    }
  }

  if (!rates['CP00'] || !latestPeriod) throw new Error('Dados CP00 não encontrados');

  const [year, month] = latestPeriod.split('-');
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const periodLabel = `${months[parseInt(month) - 1]} ${year}`;

  return {
    ...BASELINE_DATA,
    overall: rates['CP00'],
    period: latestPeriod,
    periodLabel,
    source: 'Eurostat HICP (live)',
    isLive: true,
    updatedAt: new Date().toISOString(),
    categories: BASELINE_DATA.categories.map(cat => ({
      ...cat,
      rate: rates[cat.coicop] ?? cat.rate,
    })),
  };
}

export async function GET() {
  try {
    const { data, stale, cacheStatus } = await getWithSWR(
      'inflation',
      'inflation',
      fetchEurostatInflation,
      () => BASELINE_DATA,
      EUROSTAT_URL_BASE,
    );

    return NextResponse.json(
      { inflation: data, meta: { stale, cacheStatus } },
      {
        headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=39600' },
      },
    );
  } catch (err) {
    console.error('[/api/inflation]', err);
    return NextResponse.json({ inflation: BASELINE_DATA, error: 'Serviço temporariamente indisponível' }, { status: 503 });
  }
}
