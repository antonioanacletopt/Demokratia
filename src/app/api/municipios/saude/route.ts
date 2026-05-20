import { NextRequest, NextResponse } from 'next/server';
import { fetchHealthByArs, NUTS_TO_ARS } from '@/lib/municipios-api';
import { getWithSWR } from '@/lib/data-cache';

const SOURCE_URL = 'https://transparencia.sns.gov.pt/explore/dataset/monitorizacao-sazonal-csh/download';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nuts = searchParams.get('nuts');
  const arsParam = searchParams.get('ars');

  const arsName = arsParam ?? (nuts ? NUTS_TO_ARS[nuts] : undefined);
  const cacheKey = `saude-${arsName?.toLowerCase().replace(/\s+/g, '-') ?? 'all'}`;

  const { data, fromCache, stale, cacheStatus } = await getWithSWR(
    cacheKey,
    'saude',
    () => fetchHealthByArs(arsName, 80),
    () => fetchHealthByArs(arsName, 80), // função já tem fallback interno
    SOURCE_URL,
  );

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      'X-Cache': fromCache ? 'HIT' : 'MISS',
      'X-Cache-Status': cacheStatus,
      'X-Cache-Stale': String(stale),
    },
  });
}
