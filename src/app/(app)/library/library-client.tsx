'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Book, Search, Landmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import type { Frontmatter } from '@/lib/articles';

type Article = { slug: string; frontmatter: Frontmatter };

export default function LibraryClient({ articles }: { articles: Article[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(articles.map((a) => a.frontmatter.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory = selectedCategory ? article.frontmatter.category === selectedCategory : true;
      const q = searchQuery.toLowerCase();
      const matchesSearch = q === '' || 
        article.frontmatter.title.toLowerCase().includes(q) || 
        article.frontmatter.description.toLowerCase().includes(q);
      
      return matchesCategory && matchesSearch;
    });
  }, [articles, searchQuery, selectedCategory]);

  const { t } = useTranslation();

  return (
    <div className="py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder={t('library.searchPlaceholder')} 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 items-center cursor-default">
        <span className="text-sm text-muted-foreground mr-2 font-medium">{t('library.categories')}:</span>
        <Badge
          variant={selectedCategory === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory(null)}
        >
          {t('library.all')}
        </Badge>
        {categories.map(cat => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">
        {selectedCategory ? t('library.articlesIn').replace('{{category}}', selectedCategory) : t('library.allArticles')}
        <span className="text-muted-foreground text-lg font-normal ml-2">({filteredArticles.length})</span>
      </h2>

      {filteredArticles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/library/${article.slug}`}
              className="block p-6 border rounded-lg hover:bg-muted/50 transition-colors h-full flex flex-col"
            >
              <div className="mb-3">
                <Badge variant="secondary" className="mb-2">{article.frontmatter.category}</Badge>
                <h3 className="text-xl font-semibold mb-2">{article.frontmatter.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm flex-grow">{article.frontmatter.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground border rounded-lg border-dashed">
          {t('library.noResults')}
        </div>
      )}

      <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-4">{t('library.additionalResources')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/instituicoes" className="block h-full">
                  <Card className="h-full hover:bg-muted/50 transition-colors flex flex-col justify-between border-primary/10 bg-primary/[0.02]">
                      <CardHeader>
                          <div className='mb-4 text-primary'><Landmark className='w-8 h-8' /></div>
                          <CardTitle>{t('nav.instituicoes')}</CardTitle>
                          <CardDescription>{t('instituicoes.subtitle')}</CardDescription>
                      </CardHeader>
                      <div className="p-6 pt-0 font-medium text-primary flex items-center">
                          {t('library.exploreBooks')} <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                  </Card>
              </Link>
              <Link href="/library/books" className="block h-full">
                  <Card className="h-full hover:bg-muted/50 transition-colors flex flex-col justify-between">
                      <CardHeader>
                          <div className='mb-4'><Book className='w-8 h-8' /></div>
                          <CardTitle>{t('library.recommendedBooks')}</CardTitle>
                          <CardDescription>{t('library.recommendedBooksDesc')}</CardDescription>
                      </CardHeader>
                      <div className="p-6 pt-0 font-medium text-primary flex items-center">
                          {t('library.exploreBooks')} <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                  </Card>
              </Link>
          </div>
      </div>
    </div>
  );
}
