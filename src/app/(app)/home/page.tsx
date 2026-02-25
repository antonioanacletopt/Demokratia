'use client';

import { useState, useEffect, useTransition } from 'react';
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
import { Check, Scale, TrendingUp, Loader2, Languages, RefreshCw, Sparkles, Database, ShieldCheck, Lightbulb, MessageSquarePlus } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { getNewsFeed, getTranslation } from '@/lib/actions';
import type { FeedItem as AIFeedItem } from '@/ai/flows/generate-news-feed';
import { useTranslation } from '@/lib/i18n';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { AIResultButton } from '@/components/AIResultButton';

const MAX_CACHE_LENGTH = 1000;

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
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-amber-800',
  },
};

const CACHE_EXPIRATION_HOURS = 6;

function FeedItemCard({ item }: { item: AIFeedItem }) {
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
        const targetLang = 'English';
        const fetchCached = async (text: string) => {
          if (!text || text.length > MAX_CACHE_LENGTH) return null;
          const q = query(cacheRef, where('originalText', '==', text), where('targetLanguage', '==', targetLang), limit(1));
          const snap = await getDocs(q);
          return !snap.empty ? snap.docs[0].data().translatedText : null;
        };
        const [tTitle, tDesc, tAction] = await Promise.all([
          fetchCached(item.title),
          fetchCached(item.description),
          item.actionLink ? fetchCached(item.actionLink.label) : Promise.resolve(null)
        ]);
        if (tTitle && tDesc) {
          setTranslated({ title: tTitle, desc: tDesc, actionLabel: tAction || undefined });
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
      const resTitle = await getTranslation(item.title, language);
      const resDesc = await getTranslation(item.description, language);
      const resAction = item.actionLink ? await getTranslation(item.actionLink.label, language) : undefined;
      setTranslated({ title: resTitle, desc: resDesc, actionLabel: resAction });
      setShowOriginal(false);
      const cacheRef = collection(firestore, 'translations_cache');
      const saveToCache = (orig: string, trans: string) => {
        if (orig.length > MAX_CACHE_LENGTH) return;
        addDoc(cacheRef, { originalText: orig, translatedText: trans, targetLanguage: 'English', createdAt: serverTimestamp() });
      };
      saveToCache(item.title, resTitle);
      saveToCache(item.description, resDesc);
      if (item.actionLink && resAction) saveToCache(item.actionLink.label, resAction);
    });
  };

  const currentTitle = !showOriginal && translated ? translated.title : item.title;
  const currentDesc = !showOriginal && translated ? translated.desc : item.description;
  const currentActionLabel = !showOriginal && translated?.actionLabel ? translated.actionLabel : item.actionLink?.label;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
                <CardTitle className="text-lg">{currentTitle}</CardTitle>
                {language !== 'pt' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
                    disabled={isTranslating} 
                    className="h-8 text-[10px] uppercase font-bold tracking-wider border-accent/30 text-accent hover:bg-accent/10 hover:text-accent shrink-0"
                  >
                      {isTranslating ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : translated ? <RefreshCw className="mr-1.5 h-3 w-3" /> : <Languages className="mr-1.5 h-3 w-3" />}
                      {isTranslating ? t('common.translating') : (translated ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate'))}
                  </Button>
                )}
            </div>
            <CardDescription>{t('home.source')}: {item.source} &middot; {t('home.date')}: {item.date}</CardDescription>
          </div>
          <Badge variant="outline" className={config.color}><Icon className="mr-1.5 h-3 w-3" />{t(`home.newsTypes.${item.type as any}`)}</Badge>
        </div>
      </CardHeader>
      <CardContent><p className="text-muted-foreground">{currentDesc}</p></CardContent>
      {item.actionLink && (
        <CardFooter>
          <AIResultButton href={item.actionLink.href} label={currentActionLabel!} />
        </CardFooter>
      )}
    </Card>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const [feedItems, setFeedItems] = useState<AIFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadFeed() {
      try {
        const cacheRef = doc(firestore, 'news_feed_cache', 'latest-v14');
        const cacheSnap = await getDoc(cacheRef);
        
        if (cacheSnap.exists()) {
          const cacheData = cacheSnap.data();
          const lastUpdated = cacheData.lastUpdated?.toDate() || new Date(0);
          const diffHours = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
          
          if (diffHours < CACHE_EXPIRATION_HOURS) { 
            setFeedItems(cacheData.feedItems); 
            setLoading(false); 
            return; 
          }
        }
        
        const newsFeed = await getNewsFeed();
        setFeedItems(newsFeed.feedItems);
        setDoc(cacheRef, { feedItems: newsFeed.feedItems, lastUpdated: serverTimestamp() }).catch(e => console.warn("Failed news cache", e));
      } catch (err) { 
        console.error('Failed news:', err); 
        setError(true); 
      } finally { 
        setLoading(false); 
      }
    }
    loadFeed();
  }, [firestore]);

  return (
    <div className="space-y-12">
      {/* Intro Section */}
      <section className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
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
              <Link href="/explorer"><Database className="mr-2 h-5 w-5" /> Explorar Dados</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 font-bold">
              <Link href="/proposals"><MessageSquarePlus className="mr-2 h-5 w-5" /> Partilhar Ideia</Link>
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-accent/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-accent/30 blur-[80px]" />
      </section>

      {/* How it Works Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md bg-muted/30">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-2"><TrendingUp className="h-6 w-6 text-accent" /></div>
            <CardTitle className="text-xl">Dados e Factos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Aceda a estatísticas reais e visualizações dinâmicas. Sem ruído, apenas informação bruta transformada em conhecimento.
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-muted/30">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2"><Lightbulb className="h-6 w-6 text-primary" /></div>
            <CardTitle className="text-xl">Simulações IA</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Teste o impacto de políticas antes de as propor. A nossa IA projeta efeitos económicos baseando-se em modelos científicos.
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-muted/30">
          <CardHeader className="pb-2">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-2"><ShieldCheck className="h-6 w-6 text-green-600" /></div>
            <CardTitle className="text-xl">Rigor e Isenção</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            O nosso compromisso é com a verdade. Todas as análises são baseadas em fontes oficiais e partilhadas de forma transparente.
          </CardContent>
        </Card>
      </div>

      <AdBanner />

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold font-headline">{t('home.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('home.description')}</p>
          </div>
        </div>
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t('home.loadingText')}</p>
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