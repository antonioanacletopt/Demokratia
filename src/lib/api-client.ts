/**
 * api-client.ts — Cliente para dados financeiros/mercados.
 *
 * Chama as NOSSAS próprias rotas de API, que têm cache Firestore com SWR.
 * Nenhuma chamada directa a APIs externas neste ficheiro.
 *
 * As rotas de API:
 *   GET /api/news          → notícias Alpha Vantage (cache 15 min)
 *   GET /api/quotes/[sym]  → cotações Alpha Vantage (cache 15 min)
 */

export type NewsArticle = {
  title: string;
  url: string;
  time_published: string;
  summary: string;
  banner_image?: string;
  source_domain: string;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
};

export type Quote = {
  'Global Quote'?: {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
  Note?: string;
};

export const apiClient = {
  /**
   * Obtém feed de notícias financeiras.
   * Internamente, chama GET /api/news (cache Firestore SWR 15 min).
   */
  getFinancialNews: async (): Promise<NewsArticle[]> => {
    try {
      const res = await fetch('/api/news');
      if (!res.ok) return [];
      const json = await res.json() as any;
      return json.articles ?? [];
    } catch {
      return [];
    }
  },

  /**
   * Obtém cotação de um símbolo financeiro.
   * Internamente, chama GET /api/quotes/[symbol] (cache Firestore SWR 15 min).
   *
   * Devolve no formato legado `Quote` para compatibilidade com componentes existentes.
   */
  fetchQuote: async (symbol: string): Promise<Quote | null> => {
    try {
      const res = await fetch(`/api/quotes/${encodeURIComponent(symbol)}`);
      if (!res.ok) return null;
      const json = await res.json() as any;
      if (!json.quote) return null;

      // Converter do formato normalizado para o formato legado esperado pelos componentes
      const q = json.quote;
      return {
        'Global Quote': {
          '01. symbol': q.symbol,
          '02. open': q.open,
          '03. high': q.high,
          '04. low': q.low,
          '05. price': q.price,
          '06. volume': q.volume,
          '07. latest trading day': q.latestTradingDay,
          '08. previous close': q.previousClose,
          '09. change': q.change,
          '10. change percent': q.changePercent,
        },
      };
    } catch {
      return null;
    }
  },
};
