import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { getAllArticles } from '@/lib/articles';
import LibraryClient from './library-client';
import { AdBanner } from '@/components/AdBanner';
import { getT, Language } from '@/lib/i18n-server';

export default async function LibraryPage({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = (searchParams?.lang as Language) || 'pt';
  const t = getT(lang);
  const articles = await getAllArticles();

  return (
    <div className="container max-w-6xl">
      <PageHeader>
        <PageHeaderHeading>{t('library.title')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t('library.description')}
        </PageHeaderDescription>
      </PageHeader>

      <AdBanner />

      <LibraryClient articles={articles} />
    </div>
  );
}
