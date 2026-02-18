'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, Scale, TrendingUp, Loader2 } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { getNewsFeed } from '@/lib/actions';
import type { FeedItem as AIFeedItem } from '@/ai/flows/generate-news-feed';
import { useTranslation } from '@/lib/i18n';
import { useState, useEffect } from 'react';

const typeConfig = {
  Alegação: {
    icon: Check,
    color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800',
  },
  'Nova Lei': {
    icon: Scale,
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
  },
  Análise: {
    icon: TrendingUp,
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  },
};

function FeedItemCard({ item }: { item: AIFeedItem }) {
  const { t } = useTranslation();
  const config = typeConfig[item.type];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription className="mt-1">
              {t('home.source')}: {item.source} &middot; {t('home.date')}: {item.date}
            </CardDescription>
          </div>
          <Badge variant="outline" className={config.color}>
            <Icon className="mr-1.5 h-3 w-3" />
            {item.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{item.description}</p>
      </CardContent>
      {item.actionLink && (
        <CardFooter>
          <Button asChild variant="secondary" size="sm">
            <Link href={item.actionLink.href}>
              {item.actionLink.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const [feedItems, setFeedItems] = useState<AIFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadFeed() {
      try {
        const newsFeed = await getNewsFeed();
        setFeedItems(newsFeed.feedItems);
      } catch (err) {
        console.error('Failed to fetch news feed:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          {t('home.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('home.description')}
        </p>
      </div>

      <AdBanner />

      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('home.error')}</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          feedItems.map((item) => <FeedItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
