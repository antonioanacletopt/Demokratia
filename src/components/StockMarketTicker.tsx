'use client';

import { useState, useEffect } from 'react';
import { apiClient, Quote as ApiQuote } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface TickerData {
  symbol: string;
  name: string;
  quote: ApiQuote | null;
}

export default function StockMarketTicker() {
  const { t } = useTranslation();
  const [tickerData, setTickerData] = useState<TickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const portugueseAssets = [
    { symbol: 'EDP.LS', name: t('stockTicker.assets.edp') },
    { symbol: 'GALP.LS', name: t('stockTicker.assets.galp') },
    { symbol: 'JMT.LS', name: t('stockTicker.assets.jmt') },
    { symbol: 'BCP.LS', name: t('stockTicker.assets.bcp') },
  ];

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('stockTicker.title')}</CardTitle>
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
              const price = quoteData ? parseFloat(quoteData['05. price']).toFixed(2) : t('common.na');
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
                    <p className="font-bold">{price} {t('stockTicker.currency')}</p>
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
