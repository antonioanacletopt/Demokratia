import { NextRequest, NextResponse } from 'next/server';
import { fetchCriminalityByRegion } from '@/lib/municipios-api';
import { getWithSWR } from '@/lib/data-cache';

const SOURCE_URL = 'https://dados.gov.pt/api/1/datasets/?q=criminalidade';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nuts = searchParams.get('nuts') ?? undefined;

  const cacheKey = `criminalidade-${nuts?.toLowerCase().replace(/\s+/g, '-') ?? 'all'}`;

  const { data, fromCache, stale, cacheStatus } = await getWithSWR(
    cacheKey,
    'criminalidade',
    () => fetchCriminalityByRegion(nuts),
    () => fetchCriminalityByRegion(nuts), // função já tem fallback interno
    SOURCE_URL,
  );

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
      'X-Cache': fromCache ? 'HIT' : 'MISS',
      'X-Cache-Status': cacheStatus,
      'X-Cache-Stale': String(stale),
    },
  });
}
