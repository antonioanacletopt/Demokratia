import { getPartyBySlug, getAllParties } from '@/lib/parties';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { ArrowLeft, ExternalLink, Calendar, Landmark } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getT, Language } from '@/lib/i18n-server';
import { SocialShare } from '@/components/SocialShare';

export async function generateStaticParams() {
  const parties = await getAllParties();
  return parties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;
  const lang = (langParam as Language) || 'pt';
  const t = getT(lang);
  const party = await getPartyBySlug(slug);
  if (!party) return { title: t('common.not_found') };
  
  return {
    title: `${party.frontmatter.name} (${party.frontmatter.acronym}) | Demokratia`,
    description: `${t('parties.founded')} ${party.frontmatter.founded}. ${t('parties.description')}`,
  };
}

export default async function PartyDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;
  const lang = (langParam as Language) || 'pt';
  const t = getT(lang);
  const party = await getPartyBySlug(slug);

  if (!party) {
    notFound();
  }

  const contentHtml = await marked.parse(party.content);
  const fm = party.frontmatter;

  return (
    <article className="container max-w-4xl py-12">
      <Link href={`/partidos${lang !== 'pt' ? `?lang=${lang}` : ''}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('parties.backToDirectory')}
      </Link>

      <div className="mb-12 border-b pb-8">
        <div className="flex items-center gap-6 mb-6">
          {fm.logo ? (
            <div 
              className="w-32 h-32 relative flex items-center justify-center rounded-2xl border border-black/5 shadow-lg overflow-hidden shrink-0"
              style={{ backgroundColor: fm.logoBg === 'bg-zinc-900' ? '#18181b' : fm.logoBg === 'bg-red-700' ? '#b91c1c' : fm.logoBg === 'bg-zinc-200' ? '#e4e4e7' : '#ffffff' }}
            >
              <img 
                src={fm.logo} 
                alt={`${fm.acronym} logo`}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className={`w-32 h-32 rounded-2xl flex items-center justify-center shadow-lg ${fm.color} ${fm.textColor} shrink-0`}>
               <span className="text-4xl font-black tracking-tighter">{fm.acronym}</span>
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold font-headline tracking-tight text-primary mb-2">
              {fm.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="text-sm py-1"><Landmark className="mr-1.5 h-3.5 w-3.5" />{fm.spectrum}</Badge>
              <Badge variant="outline" className="text-sm py-1 bg-muted/20"><Calendar className="mr-1.5 h-3.5 w-3.5" /> {t('parties.founded')} {fm.founded}</Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a 
            href={fm.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-accent hover:underline bg-accent/10 px-4 py-2 rounded-full transition-colors"
          >
            <ExternalLink className="mr-2 h-4 w-4" /> {t('parties.visitWebsite')}
          </a>
          <SocialShare title={fm.name} description={`${fm.spectrum} · ${t('parties.founded')} ${fm.founded}`} />
        </div>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-headline prose-headings:text-primary prose-a:text-accent prose-li:marker:text-primary prose-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: contentHtml }} />

      <div className="mt-16 pt-8 border-t bg-muted/30 p-6 rounded-2xl border flex items-start gap-4">
          <div className="p-3 bg-secondary rounded-full shrink-0">
             <Landmark className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-primary text-lg mb-1">{t('parties.aboutTitle')}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('parties.aboutContent')}
            </p>
          </div>
      </div>
    </article>
  );
}
