import { getAllParties } from '@/lib/parties';
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getT, Language } from '@/lib/i18n-server';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang: langParam } = await searchParams;
  const lang = (langParam as Language) || 'pt';
  const t = getT(lang);
  
  return {
    title: `${t('parties.title')} | Demokratia`,
    description: t('parties.description'),
  };
}

export default async function PartiesIndexPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang: langParam } = await searchParams;
  const lang = (langParam as Language) || 'pt';
  const parties = await getAllParties();
  const t = getT(lang);

  return (
    <div className="container max-w-6xl py-8">
      <PageHeader>
        <PageHeaderHeading>{t('parties.title')}</PageHeaderHeading>
        <PageHeaderDescription>
          {t('parties.description')}
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {parties.map((p) => (
          <Link href={`/partidos/${p.slug}${lang !== 'pt' ? `?lang=${lang}` : ''}`} key={p.slug}>
            <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group border-t-4" style={{ borderTopColor: 'var(--border)' }}>
              {/* Colored top bar based on party color class */}
              <div className={`h-3 w-full ${p.frontmatter.color}`}></div>
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    {p.frontmatter.logo && (
                      <div 
                        className="w-16 h-16 relative flex items-center justify-center rounded-xl border border-black/5 shadow-sm shrink-0 overflow-hidden group-hover:shadow-md transition-shadow"
                        style={{ backgroundColor: p.frontmatter.logoBg === 'bg-zinc-900' ? '#18181b' : p.frontmatter.logoBg === 'bg-red-700' ? '#b91c1c' : p.frontmatter.logoBg === 'bg-zinc-200' ? '#e4e4e7' : '#ffffff' }}
                      >
                        <img 
                          src={p.frontmatter.logo} 
                          alt={`${p.frontmatter.acronym} logo`}
                          className="w-full h-full object-contain transform transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className={`font-black text-3xl tracking-tight opacity-90 ${p.frontmatter.color.replace('bg-', 'text-')}`}>
                      {p.frontmatter.acronym}
                    </div>
                  </div>
                  <Badge variant="outline" className="font-medium bg-muted/30">
                    {t('parties.est')} {p.frontmatter.founded}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight">{p.frontmatter.name}</CardTitle>
              </CardHeader>
              
              <CardContent>
                <Badge variant="secondary" className="mb-4">
                  {p.frontmatter.spectrum}
                </Badge>
                <div className="text-sm font-semibold text-primary/70 flex items-center group-hover:text-primary transition-colors">
                  {t('parties.readProfile')} &rarr;
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
