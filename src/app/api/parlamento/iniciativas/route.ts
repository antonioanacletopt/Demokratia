import { NextRequest, NextResponse } from 'next/server';
import { fetchIniciativas, getFallbackIniciativas } from '@/lib/parlamento-api';
import { getWithSWR } from '@/lib/data-cache';

const SOURCE_URL = 'https://www.parlamento.pt/Cidadania/Pages/DadosAbertos.aspx';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const legislatura = searchParams.get('legislatura') ?? 'XVI';
  const limite = parseInt(searchParams.get('limite') ?? '20', 10);

  const cacheKey = `iniciativas-${legislatura}`;

  const { data: iniciativas, fromCache, stale, cacheStatus } = await getWithSWR(
    cacheKey,
    'iniciativas',
    () => fetchIniciativas(legislatura, 50), // cache mais do que o pedido
    getFallbackIniciativas,
    SOURCE_URL,
  );

  return NextResponse.json(
    { iniciativas: iniciativas.slice(0, limite), total: iniciativas.length, source: 'parlamento.pt', legislatura },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        'X-Cache': fromCache ? 'HIT' : 'MISS',
        'X-Cache-Status': cacheStatus,
        'X-Cache-Stale': String(stale),
      },
    },
  );
}
