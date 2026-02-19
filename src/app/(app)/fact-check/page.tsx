"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, addDoc, query, where, limit, getDocs } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { getFactCheck, getTranslation } from '@/lib/actions';
import type { FactCheckOutput } from '@/ai/flows/fact-check-claim';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ShieldCheck, History, Check, X, AlertTriangle, HelpCircle, Languages, RefreshCw } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { useTranslation } from '@/lib/i18n';
import { RefutationDialog } from '@/components/RefutationDialog';

const MAX_CACHE_LENGTH = 1000;

const verdictConfig = {
  Verdadeiro: { icon: Check, color: 'bg-green-100 text-green-800 border-green-200' },
  Falso: { icon: X, color: 'bg-red-100 text-red-800 border-red-200' },
  Enganador: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'Sem Evidência': { icon: HelpCircle, color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

function FactCheckResultDisplay({ result, claim }: { result: FactCheckOutput, claim: string }) {
  const { t, language } = useTranslation();
  const firestore = useFirestore();
  const [isTranslating, startTransition] = useTransition();
  const [translated, setTranslated] = useState<{ verdict: string, explanation: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  useEffect(() => {
    if (language === 'en' && result) {
      const checkCache = async () => {
        const cacheRef = collection(firestore, 'translations_cache');
        const targetLang = 'English';
        
        const fetchCached = async (text: string) => {
          if (!text || text.length > MAX_CACHE_LENGTH) return null;
          const q = query(cacheRef, where('originalText', '==', text), where('targetLanguage', '==', targetLang), limit(1));
          const snap = await getDocs(q);
          return !snap.empty ? snap.docs[0].data().translatedText : null;
        };

        const [tVerdict, tExpl] = await Promise.all([
          fetchCached(result.verdict),
          fetchCached(result.explanation)
        ]);

        if (tVerdict && tExpl) {
          setTranslated({ verdict: tVerdict, explanation: tExpl });
          setShowOriginal(false);
        }
      };
      checkCache();
    } else {
      setTranslated(null);
      setShowOriginal(true);
    }
  }, [language, result, firestore]);

  const handleTranslate = () => {
    startTransition(async () => {
      const resVerdict = await getTranslation(result.verdict, language);
      const resExpl = await getTranslation(result.explanation, language);
      
      setTranslated({ verdict: resVerdict, explanation: resExpl });
      setShowOriginal(false);

      const cacheRef = collection(firestore, 'translations_cache');
      const targetLang = language === 'en' ? 'English' : 'Portuguese';
      
      const saveToCache = (orig: string, trans: string) => {
        if (orig.length > MAX_CACHE_LENGTH) return;
        addDoc(cacheRef, {
          originalText: orig,
          translatedText: trans,
          targetLanguage: targetLang,
          createdAt: serverTimestamp()
        });
      };

      saveToCache(result.verdict, resVerdict);
      saveToCache(result.explanation, resExpl);
    });
  };

  const currentVerdict = !showOriginal && translated ? translated.verdict : result.verdict;
  const currentExplanation = !showOriginal && translated ? translated.explanation : result.explanation;

  const config = verdictConfig[result.verdict as keyof typeof verdictConfig] || { icon: HelpCircle, color: 'bg-gray-100 text-gray-800' };
  const VerdictIcon = config.icon;

  return (
    <Card className="border-primary/10 shadow-lg">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{t('factCheck.resultTitle')}</CardTitle>
            <CardDescription className="italic mt-1">"{claim}"</CardDescription>
          </div>
          <div className="flex gap-2">
            <RefutationDialog contentId={`factcheck-${claim}`} />
            {language !== 'pt' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
                disabled={isTranslating}
                className="h-8 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary"
              >
                {isTranslating ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : translated ? (
                  <RefreshCw className="mr-1 h-3 w-3" />
                ) : (
                  <Languages className="mr-1 h-3 w-3" />
                )}
                {isTranslating ? t('common.translating') : (translated ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate'))}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('factCheck.verdict')}</h3>
          <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${config.color}`}>
            <VerdictIcon className="h-8 w-8" />
            <span className="text-2xl font-bold font-headline">{currentVerdict}</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('factCheck.explanation')}</h3>
          <div className="bg-muted/50 p-6 rounded-xl border leading-relaxed">
            <p className="text-foreground whitespace-pre-wrap">{currentExplanation}</p>
          </div>
        </div>

        {result.sources && result.sources.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t('factCheck.sources')}</h3>
            <ul className="space-y-2">
              {result.sources.map((s, i) => (
                <li key={i} className="flex items-center gap-2 group">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  <Link href={s} target="_blank" className="text-primary hover:underline text-sm break-all font-medium">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FactCheckPage() {
  const { t, language } = useTranslation();
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState<FactCheckOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = searchParams.get('claim');
    if (q) setClaim(decodeURIComponent(q));
  }, [searchParams]);

  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'factChecks');
  }, [user, firestore]);
  const { data: history } = useCollection(historyQuery);

  const handleFactCheck = async () => {
    if (!claim.trim()) return;
    startTransition(async () => {
      setResult(null);
      const res = await getFactCheck({ claim }, language);
      setResult(res);
      if (user && firestore) {
        addDoc(collection(firestore, 'users', user.uid, 'factChecks'), {
          claim, ...res, createdAt: serverTimestamp()
        }).catch(e => console.warn("Failed to save history", e));
      }
    });
  };

  useEffect(() => {
    if ((result || isPending) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, isPending]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">{t('factCheck.title')}</h1>
        <p className="text-muted-foreground text-lg mt-2">{t('factCheck.description')}</p>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-primary" />
            {t('factCheck.cardTitle')}
          </CardTitle>
          <CardDescription>{t('factCheck.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t('factCheck.textareaPlaceholder')}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            rows={4}
            className="text-lg resize-none focus-visible:ring-primary"
            disabled={isPending}
          />
        </CardContent>
        <CardFooter className="bg-muted/30 py-4 flex justify-between items-center">
          <p className="text-xs text-muted-foreground max-w-[60%] italic">A IA utiliza fontes oficiais portuguesas para validar a alegação.</p>
          <Button onClick={handleFactCheck} disabled={isPending || !claim.trim()} size="lg" className="px-8 shadow-md">
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            {t('factCheck.checkBtn')}
          </Button>
        </CardFooter>
      </Card>
      
      <AdBanner />

      <div ref={resultRef} className="scroll-mt-20">
        {isPending && (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        )}
        {result && <FactCheckResultDisplay result={result} claim={claim} />}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><History className="h-5 w-5" />{t('factCheck.historyTitle')}</CardTitle>
          <CardDescription>{t('factCheck.historyDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-8 bg-muted/20 rounded-lg border">
              <p className="text-muted-foreground mb-4">{t('nav.login')}</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">{t('nav.login')}</Link>
              </Button>
            </div>
          ) : history && history.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {history.map((h: any) => (
                <div key={h.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors flex justify-between items-center group">
                  <div className="max-w-[80%]">
                    <p className="font-medium italic text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">"{h.claim}"</p>
                    <Badge variant={h.verdict === 'Verdadeiro' ? 'default' : 'secondary'} className="text-[10px] uppercase">{h.verdict}</Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setClaim(h.claim); setResult(h); }}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <RefutationDialog contentId={`factcheck-${h.claim}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
              <p>{t('factCheck.noHistoryTitle')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
