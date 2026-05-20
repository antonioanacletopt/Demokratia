import { NextRequest, NextResponse } from 'next/server';
import { fetchDeputados, getComposicaoPartidaria, getFallbackDeputados } from '@/lib/parlamento-api';
import { getWithSWR } from '@/lib/data-cache';

const SOURCE_URL = 'https://www.parlamento.pt/Cidadania/Pages/DadosAbertos.aspx';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const legislatura = searchParams.get('legislatura') ?? 'XVI';
  const partido = searchParams.get('partido') ?? '';

  const cacheKey = `deputados-${legislatura}`;

  const { data: allDeputados, fromCache, stale, cacheStatus } = await getWithSWR(
    cacheKey,
    'deputados',
    () => fetchDeputados(legislatura),
    getFallbackDeputados,
    SOURCE_URL,
  );

  const deputados = partido
    ? allDeputados.filter(d => d.partido.toUpperCase() === partido.toUpperCase())
    : allDeputados;

  const composicao = getComposicaoPartidaria(allDeputados);

  return NextResponse.json(
    { deputados, composicao, total: deputados.length, source: 'parlamento.pt', legislatura },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        'X-Cache': fromCache ? 'HIT' : 'MISS',
        'X-Cache-Status': cacheStatus,
        'X-Cache-Stale': String(stale),
      },
    },
  );
}
