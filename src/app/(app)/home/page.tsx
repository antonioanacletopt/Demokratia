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
import { ArrowRight, Check, Scale, TrendingUp } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { getNewsFeed } from '@/lib/actions';
import type { FeedItem as AIFeedItem } from '@/ai/flows/generate-news-feed';

// Revalida esta página no máximo a cada hora (3600 segundos) para obter notícias frescas.
export const revalidate = 3600;

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
  const config = typeConfig[item.type];
  if (!config) {
    // Fallback for unexpected types
    return null;
  }
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription className="mt-1">
              Fonte: {item.source} &middot; Data: {item.date}
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

export default async function HomePage() {
  // We use a try-catch block to handle potential errors from the AI flow.
  // If the AI fails, we can show a message instead of crashing the page.
  let feedItems: AIFeedItem[] = [];
  try {
    const newsFeed = await getNewsFeed();
    feedItems = newsFeed.feedItems;
  } catch (error) {
    console.error('Failed to fetch news feed:', error);
    // You could render a specific error component here
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Feed de Atualizações
        </h1>
        <p className="text-muted-foreground">
          Acompanhe as últimas alegações, propostas e análises no panorama
          político português.
        </p>
      </div>

      <AdBanner />

      <div className="space-y-6">
        {feedItems.length > 0 ? (
          feedItems.map((item) => <FeedItemCard key={item.id} item={item} />)
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Não foi possível carregar as notícias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ocorreu um erro ao tentar obter as últimas atualizações. Por
                favor, tente novamente mais tarde.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
