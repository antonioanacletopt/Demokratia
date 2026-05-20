/**
 * GET /api/news
 *
 * Notícias financeiras via Alpha Vantage NEWS_SENTIMENT.
 * Cache Firestore com padrão SWR: serve dados imediatamente, refresca em background.
 */
import { NextResponse } from 'next/server';
import { getWithSWR } from '@/lib/data-cache';

const NEWS_URL =
  'https://www.alphavantage.co/query?function=NEWS_SENTIMENT' +
  '&tickers=CRYPTO:BTC,FOREX:EUR,REAL_ESTATE,ECONOMY_FISCAL,MANUFACTURING&limit=10';

export interface NewsArticle {
  title: string;
  url: string;
  time_published: string;
  summary: string;
  banner_image?: string;
  source_domain: string;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
}

async function fetchNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEXT_PUBLIC_DEMOKRATIA_APIKEY;
  if (!apiKey) throw new Error('NEXT_PUBLIC_DEMOKRATIA_APIKEY not set');

  const res = await fetch(`${NEWS_URL}&apikey=${apiKey}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`);

  const json = await res.json() as any;
  if (json.Note || json.Information) {
    throw new Error(json.Note || json.Information);
  }

  return (json.feed ?? []) as NewsArticle[];
}

function fallbackNews(): NewsArticle[] {
  return [];
}

export async function GET() {
  try {
    const { data, stale, cacheStatus } = await getWithSWR(
      'news',
      'news',
      fetchNews,
      fallbackNews,
      NEWS_URL,
    );

    return NextResponse.json(
      { articles: data, meta: { stale, cacheStatus } },
      {
        headers: {
          // HTTP cache: 1 min no CDN; o Firestore faz o trabalho pesado
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=840',
        },
      },
    );
  } catch (err) {
    console.error('[/api/news]', err);
    return NextResponse.json({ articles: [], error: 'Serviço temporariamente indisponível' }, { status: 503 });
  }
}
