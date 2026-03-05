'use client';

import { useState, useEffect } from 'react';
import { apiClient, Quote as ApiQuote } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TickerData {
  symbol: string;
  name: string;
  quote: ApiQuote | null;
}

// FINAL FIX: Using a list of reliable, major Portuguese stocks
const portugueseAssets = [
  { symbol: 'EDP.LS', name: 'EDP Renováveis' },
  { symbol: 'GALP.LS', name: 'Galp Energia' },
  { symbol: 'JMT.LS', name: 'Jerónimo Martins' },
  { symbol: 'BCP.LS', name: 'BCP' },
];

export default function StockMarketTicker() {
  const [tickerData, setTickerData] = useState<TickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuotes = async () => {
      setIsLoading(true);
      const data = await Promise.all(
        portugueseAssets.map(async (asset) => {
          const quote = await apiClient.fetchQuote(asset.symbol).catch(e => {
            console.error(`Failed to load ${asset.symbol}`, e);
            return null;
          });
          return { ...asset, quote };
        })
      );
      setTickerData(data);
      setIsLoading(false);
    };

    loadQuotes();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mercado Nacional</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {tickerData.map((ticker) => {
              const quoteData = ticker.quote?.['Global Quote'];
              // Graceful handling of API failures or empty responses
              const price = quoteData ? parseFloat(quoteData['05. price']).toFixed(2) : 'N/A';
              const change = quoteData ? parseFloat(quoteData['10. change percent']) : 0;
              const isPositive = change >= 0;

              return (
                <div key={ticker.symbol} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{ticker.name}</p>
                    <p className="text-sm text-muted-foreground">{ticker.symbol}</p>
                  </div>
                  <div className={cn(
                    'text-right',
                    { 'text-green-500': isPositive, 'text-red-500': !isPositive }
                  )}>
                    <p className="font-bold">{price} EUR</p>
                    <div className="flex items-center justify-end">
                      {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      <span>{change.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
