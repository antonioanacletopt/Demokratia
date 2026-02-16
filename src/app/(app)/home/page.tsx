'use client';

import Link from 'next/link';
import { feedData, FeedItem } from '@/lib/feed-data';
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
import { ArrowRight } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';

const typeColors = {
  Alegação: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800',
  'Nova Lei': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
  Análise: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
};

function FeedItemCard({ item }: { item: FeedItem }) {
    const colorClass = typeColors[item.type];

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
                    <Badge variant="outline" className={colorClass}>
                        <item.icon className="mr-1.5 h-3 w-3" />
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
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Feed de Atualizações</h1>
        <p className="text-muted-foreground">Acompanhe as últimas alegações, propostas e análises no panorama político português.</p>
      </div>

      <AdBanner />

      <div className="space-y-6">
        {feedData.map((item) => (
          <FeedItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
