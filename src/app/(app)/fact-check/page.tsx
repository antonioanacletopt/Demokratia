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

const verdictConfig = {
  Verdadeiro: { icon: Check, color: 'bg-green-100 text-green-800' },
  Falso: { icon: X, color: 'bg-red-100 text-red-800' },
  Enganador: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800' },
  'Sem Evidência': { icon: HelpCircle, color: 'bg-gray-100 text-gray-800' },
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{t('factCheck.resultTitle')}</CardTitle>
          <div className="flex gap-2">
            <RefutationDialog contentId={`factcheck-${claim}`} />
            {language !== 'pt' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
                disabled={isTranslating}
                className="h-8 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary"
              >
                {isTranslating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : translated ? <RefreshCw className="mr-1 h-3 w-3" /> : <Languages className="mr-1 h-3 w-3" />}
                {isTranslating ? t('common.translating') : (translated ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate'))}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">{t('factCheck.verdict')}</h3>
          <div className={`flex items-center gap-2 p-3 rounded-md border ${config.color}`}>
            <VerdictIcon className="h-6 w-6" />
            <span className="font-bold">{currentVerdict}</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">{t('factCheck.explanation')}</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{currentExplanation}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">{t('factCheck.sources')}</h3>
          <ul className="space-y-1">
            {result.sources.map((s, i) => (
              <li key={i}>
                <Link href={s} target="_blank" className="text-primary hover:underline text-sm break-all">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('factCheck.title')}</h1>
        <p className="text-muted-foreground">{t('factCheck.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
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
            disabled={isPending}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleFactCheck} disabled={isPending || !claim.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('factCheck.checkBtn')}
          </Button>
        </CardFooter>
      </Card>
      
      <AdBanner />

      <div ref={resultRef}>
        {isPending && <Skeleton className="h-40 w-full" />}
        {result && <FactCheckResultDisplay result={result} claim={claim} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />{t('factCheck.historyTitle')}</CardTitle>
          <CardDescription>{t('factCheck.historyDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!user ? <p>{t('nav.login')}</p> : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((h: any) => (
                <div key={h.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium italic mb-2">"{h.claim}"</p>
                    <Badge>{h.verdict}</Badge>
                  </div>
                  <RefutationDialog contentId={`factcheck-${h.claim}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('factCheck.noHistoryTitle')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}