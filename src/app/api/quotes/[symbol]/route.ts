/**
 * GET /api/quotes/[symbol]
 *
 * Cotação de um símbolo financeiro via Alpha Vantage GLOBAL_QUOTE.
 * Cache Firestore por símbolo com padrão SWR.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getWithSWR } from '@/lib/data-cache';

export interface QuoteData {
  symbol: string;
  open: string;
  high: string;
  low: string;
  price: string;
  volume: string;
  latestTradingDay: string;
  previousClose: string;
  change: string;
  changePercent: string;
}

async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  const apiKey = process.env.NEXT_PUBLIC_DEMOKRATIA_APIKEY;
  if (!apiKey) throw new Error('NEXT_PUBLIC_DEMOKRATIA_APIKEY not set');

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`);

  const json = await res.json() as any;
  if (json.Note || json.Information) throw new Error(json.Note || json.Information);

  const gq = json['Global Quote'];
  if (!gq || !gq['05. price']) throw new Error('Resposta inválida da API');

  return {
    symbol: gq['01. symbol'],
    open: gq['02. open'],
    high: gq['03. high'],
    low: gq['04. low'],
    price: gq['05. price'],
    volume: gq['06. volume'],
    latestTradingDay: gq['07. latest trading day'],
    previousClose: gq['08. previous close'],
    change: gq['09. change'],
    changePercent: gq['10. change percent'],
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  if (!symbol) {
    return NextResponse.json({ error: 'Símbolo obrigatório' }, { status: 400 });
  }

  const key = `quote-${symbol.toUpperCase()}`;

  try {
    const { data, stale, cacheStatus } = await getWithSWR(
      key,
      'quotes',
      () => fetchQuote(symbol),
      () => null,
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}`,
    );

    if (!data) {
      return NextResponse.json(
        { quote: null, meta: { stale, cacheStatus } },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { quote: data, meta: { stale, cacheStatus } },
      {
        headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=840' },
      },
    );
  } catch (err) {
    console.error(`[/api/quotes/${symbol}]`, err);
    return NextResponse.json({ quote: null, error: 'Serviço temporariamente indisponível' }, { status: 503 });
  }
}
