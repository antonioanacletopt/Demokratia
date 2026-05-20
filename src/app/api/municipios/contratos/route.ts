import { NextRequest, NextResponse } from 'next/server';
import { fetchContratosByMunicipio, getFallbackContratos } from '@/lib/municipios-api';
import { getWithSWR } from '@/lib/data-cache';

const SOURCE_URL = 'https://www.base.gov.pt/Base4/rest/contratos';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const localidade = searchParams.get('localidade') ?? '';
  const ano = searchParams.get('ano') ? parseInt(searchParams.get('ano')!, 10) : undefined;
  const page = parseInt(searchParams.get('page') ?? '0', 10);

  if (!localidade) {
    return NextResponse.json({ error: 'localidade is required' }, { status: 400 });
  }

  const cacheKey = `contratos-${localidade.toLowerCase().replace(/\s+/g, '-')}-${ano ?? 'all'}-p${page}`;

  const { data, fromCache, stale, cacheStatus } = await getWithSWR(
    cacheKey,
    'contratos',
    () => fetchContratosByMunicipio(localidade, ano, page, 25),
    () => getFallbackContratos(localidade),
    SOURCE_URL,
  );

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      'X-Cache': fromCache ? 'HIT' : 'MISS',
      'X-Cache-Status': cacheStatus,
      'X-Cache-Stale': String(stale),
    },
  });
}
