import { z } from 'zod';

// --- Caching --- 
const CACHE_DURATION_MS = 1000 * 60 * 15; // 15 minutes
const cache: { [key: string]: { timestamp: number, data: any } } = {};

// --- Zod Schemas for API Response Validation ---

// FINAL FIX: Made the 'Global Quote' object optional and added a 'Note' field.
// This handles cases where the API limit is reached and it returns a note instead of data.
const QuoteSchema = z.object({
  'Global Quote': z.object({
    '01. symbol': z.string(),
    '02. open': z.string(),
    '03. high': z.string(),
    '04. low': z.string(),
    '05. price': z.string(),
    '06. volume': z.string(),
    '07. latest trading day': z.string(),
    '08. previous close': z.string(),
    '09. change': z.string(),
    '10. change percent': z.string(),
  }).optional(), // The entire object can be missing
  'Note': z.string().optional(), // It might return a note about API usage
});

const NewsArticleSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  time_published: z.string(),
  summary: z.string(),
  banner_image: z.string().url().optional(),
  source_domain: z.string(),
  overall_sentiment_score: z.number(),
  overall_sentiment_label: z.string(),
});

// Added a 'Note' field here as well for the same API limit reason.
const NewsApiResponseSchema = z.object({
  feed: z.array(NewsArticleSchema).optional(),
  Note: z.string().optional(), 
});


// --- Type Definitions ---
export type Quote = z.infer<typeof QuoteSchema>;
export type NewsArticle = z.infer<typeof NewsArticleSchema>;


// --- Private Helper Function for API Fetching ---

async function fetchFromApi<T extends z.ZodType<any, any>>(url: string, schema: T): Promise<z.infer<T> | null> {
  const apiKey = process.env.NEXT_PUBLIC_DEMOKRATIA_APIKEY;
  if (!apiKey) {
    console.error('API key is not configured.');
    return null;
  }

  const fullUrl = `${url}&apikey=${apiKey}`;

  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Validate the response against the provided Zod schema
    const validationResult = schema.safeParse(data);
    if (!validationResult.success) {
      console.error('API response validation error:', validationResult.error);
      return null;
    }
    
    return validationResult.data;

  } catch (error) {
    console.error('API request failed:', error);
    return null;
  }
}


// --- Main API Client ---

export const apiClient = {
  getFinancialNews: async (): Promise<NewsArticle[]> => {
    const cacheKey = 'financialNews';
    const now = Date.now();

    if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_DURATION_MS) {
      return cache[cacheKey].data;
    }

    console.log('Fetching financial news from Alpha Vantage API...');
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=CRYPTO:BTC,FOREX:EUR,REAL_ESTATE,ECONOMY_FISCAL,MANUFACTURING&limit=10`;
    const apiResponse = await fetchFromApi(url, NewsApiResponseSchema);

    const newsFeed = apiResponse?.feed || []; // Gracefully handle if feed is missing

    if (newsFeed.length > 0) {
      cache[cacheKey] = { timestamp: now, data: newsFeed };
    }

    return newsFeed;
  },

  fetchQuote: async (symbol: string): Promise<Quote | null> => {
    const cacheKey = `quote_${symbol}`;
    const now = Date.now();

    if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_DURATION_MS) {
      return cache[cacheKey].data;
    }

    console.log(`Fetching quote for ${symbol} from Alpha Vantage API...`);
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}`;
    const quoteData = await fetchFromApi(url, QuoteSchema);

    // Only cache if the response is valid and not an API limit note
    if (quoteData && quoteData['Global Quote']) {
      cache[cacheKey] = { timestamp: now, data: quoteData };
    }

    return quoteData;
  }
};