'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { 
  Home, 
  Check, 
  Scale, 
  TrendingUp, 
  Loader2, 
  Languages, 
  RefreshCw, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  Lightbulb, 
  ArrowRight, 
  BarChart3, 
  Globe, 
  ThumbsUp, 
  Users, 
  Map as MapIcon, 
  Calculator, 
  Wallet, 
  Zap, 
  BookOpen,
  Landmark
} from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { getNewsFeed, getTranslation, type NewsFeedOutput, type NewsFeedItem } from '@/lib/actions';
import { useTranslation, Language } from '@/lib/i18n';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, serverTimestamp, doc, getDoc, setDoc, orderBy, limit, where, getDocs } from 'firebase/firestore';
import AIResultButton from '@/components/AIResultButton';
import { cn } from '@/lib/utils';

const MAX_CACHE_LENGTH = 1000;

const typeConfig = {
  claim: {
    icon: Check,
    color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800',
  },
  new_law: {
    icon: Scale,
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
  },
  analysis: {
    icon: TrendingUp,
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-amber-800',
  },
};

function FeedItemCard({ item }: { item: NewsFeedItem }) {
  const { t, language } = useTranslation();
  const firestore = useFirestore();
  const config = typeConfig[item.type as keyof typeof typeConfig];
  const [isTranslating, startTransition] = useTransition();
  const [translated, setTranslated] = useState<{ title: string, desc: string, actionLabel?: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  useEffect(() => {
    if (language === 'en' && item) {
      const checkCache = async () => {
        const cacheRef = collection(firestore, 'translations_cache');
        const fetchCached = async (text: string) => {
          if (!text || text.length > MAX_CACHE_LENGTH) return null;
          const q = query(cacheRef, where('originalText', '==', text), where('targetLanguage', '==', 'English'), limit(1));
          const snap = await getDocs(q);
          return !snap.empty ? snap.docs[0].data().translatedText : null;
        };
        const [tTitle, tDesc] = await Promise.all([
          fetchCached(item.title),
          fetchCached(item.description)
        ]);
        if (tTitle && tDesc) {
          setTranslated({ title: tTitle, desc: tDesc });
          setShowOriginal(false);
        }
      };
      checkCache();
    } else {
      setTranslated(null);
      setShowOriginal(true);
    }
  }, [language, item, firestore]);

  if (!config) return null;
  const Icon = config.icon;

  const handleTranslate = () => {
    startTransition(async () => {
      const resTitle = await getTranslation(item.title, language as Language);
      const resDesc = await getTranslation(item.description, language as Language);
      setTranslated({ title: resTitle, desc: resDesc });
      setShowOriginal(false);
      const cacheRef = collection(firestore, 'translations_cache');
      const saveToCache = (orig: string, trans: string) => {
        if (orig.length > MAX_CACHE_LENGTH) return;
        setDoc(doc(cacheRef), { originalText: orig, translatedText: trans, targetLanguage: 'English', createdAt: serverTimestamp() }, { merge: true });
      };
      saveToCache(item.title, resTitle);
      saveToCache(item.description, resDesc);
    });
  };

  const currentTitle = !showOriginal && translated ? translated.title : item.title;
  const currentDesc = !showOriginal && translated ? translated.desc : item.description;

  return (
    <Card className="overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
                <CardTitle className="text-lg leading-snug">{currentTitle}</CardTitle>
                {language !== 'pt' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
                    disabled={isTranslating} 
                    className="h-8 text-[10px] uppercase font-bold tracking-wider border-accent/30 text-accent hover:bg-accent/10 hover:text-accent shrink-0"
                  >
                      {isTranslating ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Languages className="mr-1.5 h-3 w-3" />}
                      {isTranslating ? t('common.translating') : (translated ? (showOriginal ? t('common.showOriginal') : t('common.translate')) : t('common.translate'))}
                  </Button>
                )}
            </div>
            <CardDescription className="text-xs">{t('home.source')}: {item.source} &middot; {item.date}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge variant="outline" className={cn(config.color, "whitespace-nowrap")}><Icon className="mr-1.5 h-3.5 w-3.5" />{t(`home.newsTypes.${item.type}` as any)}</Badge>
            <Badge variant="secondary" className="text-[9px] font-bold bg-primary/5 text-primary/60 border-primary/10 tracking-tight flex items-center gap-1 py-0 px-1.5">
              <Sparkles className="size-2.5" /> Contexto IA / Original
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4"><p className="text-muted-foreground leading-relaxed">{currentDesc}</p></CardContent>
      {item.actionLink && (
        <CardFooter className="bg-muted/5 border-t py-3">
          <AIResultButton href={item.actionLink.href} label={t('home.simImpact')} />
        </CardFooter>
      )}
    </Card>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const [feedItems, setFeedItems] = useState<NewsFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const heroImg = useMemo(() => {
    const img = PlaceHolderImages.find(img => img.id === 'hero-portugal');
    if (!img) return null;
    return {
      ...img,
      description: t(img.descriptionKey as any),
      imageHint: t(img.imageHintKey as any),
    };
  }, [t]);

  const regionalImg = useMemo(() => {
    const img = PlaceHolderImages.find(img => img.id === 'porto-ribera');
    if (!img) return null;
    return {
      ...img,
      description: t(img.descriptionKey as any),
      imageHint: t(img.imageHintKey as any),
    };
  }, [t]);

  const proposalsRef = useMemoFirebase(() => query(collection(firestore, 'communityProposals'), orderBy('voteCount', 'desc'), limit(3)), [firestore]);
  const { data: popularProposals } = useCollection<any>(proposalsRef);

  useEffect(() => {
    async function loadFeed() {
      try {
        const newsFeed = await getNewsFeed();
        setFeedItems(newsFeed.feedItems);
      } catch (err) { console.error('[HomePage] Failed to load feed:', err); setError(true); } finally { setLoading(false); }
    }
    loadFeed();
  }, []);

  return (
    <div className="space-y-12">
        {heroImg && (
            <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-2xl">
                <div className="absolute inset-0 z-0">
                <Image 
                    src={heroImg.imageUrl} 
                    alt={heroImg.description} 
                    fill 
                    className="object-cover opacity-30 mix-blend-overlay" 
                    priority
                    data-ai-hint={heroImg.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
                </div>
                
                <div className="relative z-10 max-w-3xl space-y-6 px-6 py-12 sm:px-12 sm:py-16">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1 text-sm font-semibold uppercase tracking-wider">
                    <Sparkles className="mr-2 h-4 w-4 fill-white animate-pulse" /> {t('home.welcomeSubtitle')}
                </Badge>
                <h1 className="text-4xl font-bold font-headline leading-tight sm:text-5xl lg:text-6xl tracking-tight">
                    {t('home.welcomeTitle')}
                </h1>
                <p className="text-lg opacity-90 leading-relaxed max-w-2xl font-medium">
                    {t('home.welcomeIntro')}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                    <Button asChild size="lg" variant="secondary" className="font-bold shadow-lg">
                    <Link href="/explorer"><Database className="mr-2 h-5 w-5" /> {t('nav.explorer')}</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 font-bold">
                    <Link href="/map"><MapIcon className="mr-2 h-5 w-5" /> {t('nav.map')}</Link>
                    </Button>
                </div>
                </div>
            </section>
        )}

      <div className="grid gap-8 lg:grid-cols-3 bg-muted/30 p-8 rounded-3xl border shadow-inner">
        <div className="lg:col-span-2 space-y-4">
          <Badge variant="outline" className="text-accent border-accent/30">{t('about.missionTitle')}</Badge>
          <h2 className="text-3xl font-bold font-headline text-primary">Informação Cívica ao Serviço do Cidadão</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('about.missionDesc')}
          </p>
        </div>
        <div className="flex items-center justify-center p-6 bg-background/50 rounded-2xl border border-dashed">
          <div className="text-center space-y-2">
            <p className="text-4xl font-black text-accent">100%</p>
            <p className="text-[10px] uppercase tracking-tighter font-bold text-muted-foreground">Neutralidade Tecnológica</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {[
          { href: '/irs', icon: Calculator, label: t('nav.irs'), desc: t('home.tooltips.irs'), color: 'primary' },
          { href: '/budget', icon: Wallet, label: t('nav.budget'), desc: t('home.tooltips.budget'), color: 'primary' },
          { href: '/map', icon: MapIcon, label: t('nav.map'), desc: t('home.tooltips.map'), color: 'accent' },
          { href: '/scenarios', icon: Zap, label: t('nav.scenarios'), desc: t('home.tooltips.scenarios'), color: 'accent' },
          { href: '/fact-check', icon: ShieldCheck, label: t('nav.factCheck'), desc: t('home.tooltips.factCheck'), color: 'green-600' },
          { href: '/legislation', icon: Scale, label: t('nav.legislation'), desc: t('home.tooltips.legislation'), color: 'blue-600' }
        ].map((tool) => (
          <Card key={tool.href} className="bg-muted/20 border-none hover:bg-muted/30 transition-all group shadow-sm hover:shadow-md">
            <Link href={tool.href}>
              <CardHeader className="p-4">
                <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-inner">
                  <tool.icon className={cn("h-6 w-6", `text-${tool.color}`)} />
                </div>
                <CardTitle className="text-base">{tool.label}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{tool.desc}</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3 bg-card p-8 rounded-3xl border shadow-sm">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-3xl font-bold font-headline text-primary">{t('home.methodologyTitle')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('home.methodologyDesc')}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/partidos">
                <Users className="size-5" />
                {t('nav.partidos')}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/instituicoes">
                <Landmark className="size-5" />
                {t('nav.instituicoes')}
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Check className="text-green-500 h-5 w-5" /> {t('home.methodologySources')}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Check className="text-green-500 h-5 w-5" /> {t('home.methodologyNeutrality')}
            </div>
            <Button asChild variant="link" className="text-accent p-0 h-auto font-bold">
              <Link href="/methodology">{t('common.learnMore')} <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4 justify-center">
          <div className="p-4 rounded-2xl bg-muted/50 border flex items-center gap-4">
            <BarChart3 className="text-primary h-8 w-8" />
            <div>
              <p className="font-bold text-sm">{t('home.infoINE')}</p>
              <p className="text-xs text-muted-foreground">{t('home.infoINEDesc')}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-muted/50 border flex items-center gap-4">
            <Globe className="text-primary h-8 w-8" />
            <div>
              <p className="font-bold text-sm">{t('home.infoEurostat')}</p>
              <p className="text-xs text-muted-foreground">{t('home.infoEurostatDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent" /> {t('home.learnDesc')}
            </h2>
            <p className="text-muted-foreground text-sm">{t('home.learnSub') || 'Artigos estáticos essenciais de literacia económica e financeira.'}</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/library">{t('home.seeAll')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: t('home.articles.fiscal.title'), desc: t('home.articles.fiscal.desc'), slug: 'como-funciona-sistema-fiscal' },
            { title: t('home.articles.deficit.title'), desc: t('home.articles.deficit.desc'), slug: 'o-que-e-defice-orcamental' },
            { title: t('home.articles.budget.title'), desc: t('home.articles.budget.desc'), slug: 'o-que-e-o-orcamento-de-estado' }
          ].map(art => (
            <Card key={art.slug} className="hover:shadow-md transition-all border-accent/10">
              <Link href={`/library/${art.slug}`}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base font-bold leading-snug">{art.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3">{art.desc}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <AdBanner />

      {popularProposals && popularProposals.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                <Users className="h-6 w-6 text-accent" /> {t('home.proposals.communityTitle')}
              </h2>
              <p className="text-muted-foreground text-sm">{t('home.proposals.subtitle')}</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/proposals">{t('home.proposals.seeAll')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {popularProposals.map((p: any) => (
              <Card key={p.id} className="hover:shadow-md transition-all border-accent/10">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm font-bold line-clamp-2 leading-snug">{p.title}</CardTitle>
                    <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 shrink-0">
                      <ThumbsUp className="h-3 w-3" /> {p.voteCount}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3 italic">\"{p.description}\"</p>
                </CardContent>
                <CardFooter className="p-3 bg-muted/30 flex justify-center">
                  <Button asChild variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold text-accent">
                    <Link href={`/simulations?policy=${encodeURIComponent(p.description)}`}>{t('home.simImpact')}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

        {regionalImg && (
            <div className="relative h-[300px] w-full rounded-3xl overflow-hidden shadow-xl border">
                <Image src={regionalImg.imageUrl} alt={regionalImg.description} fill className="object-cover" data-ai-hint={regionalImg.imageHint} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8">
                <div className="max-w-xl space-y-2">
                    <h3 className="text-2xl font-bold text-white">{t('home.regionalTitle')}</h3>
                    <p className="text-white/80 text-sm">{t('home.regionalDesc')}</p>
                </div>
                </div>
            </div>
        )}

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold font-headline">{t('home.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('home.description')}</p>
          </div>
        </div>
        <div className="space-y-6">
          {loading ? (
            <div className="grid gap-6">
              {[1,2,3,4].map(i => <Card key={i} className="h-32 animate-pulse bg-muted/20" />)}
            </div>
          ) : error ? (
            <Card><CardHeader><CardTitle>{t('home.error')}</CardTitle></CardHeader></Card>
          ) : (
            feedItems.map((item) => <FeedItemCard key={item.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  );
}
