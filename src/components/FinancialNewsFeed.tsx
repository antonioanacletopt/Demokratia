'use client';

import { useEffect, useState } from 'react';
import { apiClient, type NewsArticle } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink } from 'lucide-react';

function formatPublishedDate(dateString: string): string {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const hours = dateString.substring(9, 11);
  const minutes = dateString.substring(11, 13);
  const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return `${Math.floor(diffMs / (1000 * 60))} minutos atrás`;
  }
  if (diffHours < 24) {
    return `${diffHours} horas atrás`;
  }
  return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
}

function getSentimentColor(score: number): string {
  if (score > 0.35) return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200/50';
  if (score < -0.15) return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200/50';
  return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200/50';
}

export function FinancialNewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      const fetchedNews = await apiClient.getFinancialNews();
      setNews(fetchedNews);
      setIsLoading(false);
    };

    loadNews();
  }, []);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Notícias Financeiras Globais</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <a 
                key={index} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-4 rounded-lg hover:bg-muted/50 transition-colors border group"
              >
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-base mb-2 pr-4 group-hover:text-primary">{item.title}</p>
                  {item.banner_image && (
                    <img src={item.banner_image} alt={item.title} className="w-24 h-16 object-cover rounded-md" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.summary}</p>
                <div className="flex justify-between items-center text-xs">
                  <Badge variant="outline" className={getSentimentColor(item.overall_sentiment_score)}>
                    {item.overall_sentiment_label}
                  </Badge>
                  <div className="text-muted-foreground">
                    <span>{item.source_domain}</span> &bull; <span>{formatPublishedDate(item.time_published)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
