'use client';

import { useState, useEffect } from 'react';
import { apiClient, Quote as ApiQuote } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommodityData {
  symbol: string;
  name: string;
  quote: ApiQuote | null;
}

// FINAL FIX: Using correct ETF symbols compatible with the API
const commodities = [
  { symbol: 'GLD', name: 'Ouro (ETF)' },
  { symbol: 'BNO', name: 'Petróleo Brent (ETF)' },
];

export default function CommoditiesWatch() {
  const [commoditiesData, setCommoditiesData] = useState<CommodityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuotes = async () => {
      setIsLoading(true);
      const data = await Promise.all(
        commodities.map(async (commodity) => {
          const quote = await apiClient.fetchQuote(commodity.symbol).catch(e => {
            console.error(`Failed to load ${commodity.symbol}`, e);
            return null;
          });
          return { ...commodity, quote };
        })
      );
      setCommoditiesData(data);
      setIsLoading(false);
    };

    loadQuotes();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commodities</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {commoditiesData.map((commodity) => {
              const quoteData = commodity.quote?.['Global Quote'];
              // Graceful handling of API failures or empty responses
              const price = quoteData ? parseFloat(quoteData['05. price']).toFixed(2) : 'N/A';
              const change = quoteData ? parseFloat(quoteData['10. change percent']) : 0;
              const isPositive = change >= 0;

              return (
                <div key={commodity.symbol} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{commodity.name}</p>
                    <p className="text-sm text-muted-foreground">{commodity.symbol}</p>
                  </div>
                  <div className={cn(
                    'text-right',
                    { 'text-green-500': isPositive, 'text-red-500': !isPositive }
                  )}>
                    <p className="font-bold">{price} USD</p>
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
