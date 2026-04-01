"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, doc, setDoc, query, where, limit, getDocs, orderBy, getDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { getFactCheck, getTranslation, type FactCheckOutput } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ShieldCheck, History, Check, X, AlertTriangle, HelpCircle, Languages, RefreshCw, MessageSquareWarning, ExternalLink, Info, Trash2, Sparkles } from 'lucide-react';
import { SocialShare } from '@/components/SocialShare';
import { AdBanner } from '@/components/AdBanner';
import { useTranslation, Language } from '@/lib/i18n';
import { RefutationDialog } from '@/components/RefutationDialog';
import { safeDecode } from '@/lib/safe-decode';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const MAX_CACHE_LENGTH = 1000;

const verdictConfig = {
  Verdadeiro: { 
    icon: Check, 
    color: 'bg-green-600 text-white border-green-700 dark:bg-green-700',
    badge: 'bg-green-600 hover:bg-green-700 text-white border-transparent'
  },
  Falso: { 
    icon: X, 
    color: 'bg-red-600 text-white border-red-700 dark:bg-red-700',
    badge: 'bg-red-600 hover:bg-red-700 text-white border-transparent'
  },
  Enganador: { 
    icon: AlertTriangle, 
    color: 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600',
    badge: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent'
  },
  'Sem Evidência': { 
    icon: HelpCircle, 
    color: 'bg-slate-500 text-white border-slate-600 dark:bg-slate-600',
    badge: 'bg-slate-500 hover:bg-slate-600 text-white border-transparent'
  },
};

function generateSlug(text: string): string {
  if (!text) return '';
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 150);
}

function FactCheckResultDisplay({ result, claim }: { result: FactCheckOutput, claim: string }) {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isTranslating, startTransition] = useTransition();
  const [translated, setTranslated] = useState<{ verdict: string, explanation: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);


  useEffect(() => {
    if (language === 'en' && result) {
      const checkCache = async () => {
        if (result.verdict.length > MAX_CACHE_LENGTH || result.explanation.length > MAX_CACHE_LENGTH) return;
        const cacheRef = collection(firestore, 'translations_cache');
        const fetchCached = async (text: string) => {
          if (!text || text.length > MAX_CACHE_LENGTH) return null;
          const q = query(cacheRef, where('originalText', '==', text), where('targetLanguage', '==', 'English'), limit(1));
          const snap = await getDocs(q);
          return !snap.empty ? snap.docs[0].data().translatedText : null;
        };
        const [tVerdict, tExpl] = await Promise.all([
          fetchCached(result.verdict),
          fetchCached(result.explanation)
        ]);
        if (tVerdict || tExpl) {
          setTranslated({ verdict: tVerdict || result.verdict, explanation: tExpl || result.explanation });
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
      const resVerdict = await getTranslation(result.verdict, language as Language);
      const resExpl = await getTranslation(result.explanation, language as Language);
      setTranslated({ verdict: resVerdict, explanation: resExpl });
      setShowOriginal(false);
      const cacheRef = collection(firestore, 'translations_cache');
      const saveToCache = (orig: string, trans: string) => {
        if (!orig || orig.length > MAX_CACHE_LENGTH) return;
        setDoc(doc(cacheRef), { originalText: orig, translatedText: trans, targetLanguage: 'English', createdAt: serverTimestamp() });
      };
      saveToCache(result.verdict, resVerdict);
      saveToCache(result.explanation, resExpl);
    });
  };

  const shareUrl = typeof window !== 'undefined'
    ? (() => { const u = new URL(window.location.href); u.searchParams.set('claim', claim); return u.toString(); })()
    : '';

  const currentVerdict = !showOriginal && translated ? translated.verdict : result.verdict;
  const currentExplanation = !showOriginal && translated ? translated.explanation : result.explanation;
  const config = verdictConfig[result.verdict as keyof typeof verdictConfig] || verdictConfig['Sem Evidência'];
  const VerdictIcon = config.icon;

  return (
    <Card className="border-primary/10 shadow-lg overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />{t('factCheck.resultTitle')}</CardTitle>
            <CardDescription className="italic mt-1 line-clamp-2">"{claim}"</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <SocialShare
              url={shareUrl}
              title={`Fact-Check: "${claim}"`}
              description={result.verdict}
            />
            <RefutationDialog contentId={`factcheck-${generateSlug(claim)}`} trigger={<Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs hover:bg-destructive hover:text-destructive-foreground border-destructive/20 text-destructive"><MessageSquareWarning className="h-3.5 w-3.5" />{t('refutation.refuteBtn')}</Button>} />
            {language !== 'pt' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
                disabled={isTranslating} 
                className="h-8 gap-1.5 text-xs border-accent/50 text-accent font-bold hover:bg-accent/10 hover:text-accent"
              >
                {isTranslating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
                {isTranslating ? t('common.translating') : (translated ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate'))}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t('factCheck.verdict')}</h3>
          <div className={cn("flex items-center gap-4 p-5 rounded-2xl border-2 shadow-sm", config.color)}>
            <div className="bg-white/20 p-2 rounded-full">
              <VerdictIcon className="h-8 w-8" />
            </div>
            <span className="text-3xl font-bold font-headline tracking-tight">{currentVerdict}</span>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t('factCheck.explanation')}</h3>
          <div className="bg-muted/40 p-6 rounded-2xl border leading-relaxed shadow-inner">
            <p className="text-foreground whitespace-pre-wrap text-base">{currentExplanation}</p>
          </div>
        </div>
        {result.sources && result.sources.length > 0 && (
          <div className="pt-4 border-t border-dashed">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{t('factCheck.sources')}</h3>
            <ul className="grid gap-3 sm:grid-cols-1">
              {result.sources.map((s, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <Link href={s} target="_blank" className="text-primary hover:underline text-sm break-all font-medium leading-tight flex items-center gap-1.5">
                    {s}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/10 border-t py-3 flex justify-center">
        <p className="text-[10px] text-muted-foreground italic">{t('factCheck.aiDisclaimer')}</p>
      </CardFooter>
    </Card>
  );
}

export default function FactCheckPage() {
  const { t, language } = useTranslation();
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState<FactCheckOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const processedRef = useRef<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFactCheck = useCallback((customClaim?: string) => {
    const textToUse = (customClaim || claim).trim();
    if (!textToUse) return;
    // Include language in cache key so PT and EN results are stored separately
    const claimId = generateSlug(textToUse) + '-' + language;

    startTransition(async () => {
      try {
        setResult(null);

        if (firestore) {
          const publicRef = doc(firestore, 'publicFactChecks', claimId);
          const snap = await getDoc(publicRef);
          if (snap.exists()) {
            setResult(snap.data() as FactCheckOutput);
            return;
          }
        }

        const res = await getFactCheck({ claim: textToUse }, language as Language);
        setResult(res);
        
        if (firestore) {
          const publicRef = doc(firestore, 'publicFactChecks', claimId);
          setDoc(publicRef, { claim: textToUse, ...res, createdAt: serverTimestamp() }, { merge: true }).catch(() => {});
          
          if (user) {
            const userRef = doc(firestore, 'users', user.uid, 'factChecks', claimId);
            setDoc(userRef, { userId: user.uid, claim: textToUse, ...res, createdAt: serverTimestamp() }, { merge: true }).catch(() => {});
          }
        }
      } catch (e: any) {
        toast({ variant: 'destructive', title: t('common.error'), description: e.message || t('common.genericError') });
      }
    });
  }, [claim, language, user, firestore]);

  useEffect(() => {
    const q = searchParams.get('claim');
    if (q && q !== processedRef.current) {
      processedRef.current = q;
      // Decode URL slug: converts underscores/hyphens to spaces for readability
      const decoded = safeDecode(q).replace(/[_-]/g, ' ').trim();
      setClaim(decoded);
      handleFactCheck(decoded);
    }
  }, [searchParams, handleFactCheck]);

  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'factChecks'), orderBy('createdAt', 'desc'), limit(10));
  }, [user, firestore]);
  const { data: history } = useCollection(historyQuery);

  const recentPublicChecksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publicFactChecks'), orderBy('createdAt', 'desc'), limit(6));
  }, [firestore]);
  const { data: recentPublicChecks, isLoading: isLoadingPublic } = useCollection(recentPublicChecksQuery);

  useEffect(() => { 
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleDeleteHistory = async (id: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'factChecks', id));
      toast({ title: t('common.success') });
    } catch (e) {
      toast({ variant: 'destructive', title: t('common.error') });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">{t('factCheck.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('factCheck.description')}</p>
        <div className="bg-muted/30 p-4 rounded-xl border border-muted flex gap-3 items-start mt-2">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('factCheck.howItWorks')}
          </p>
        </div>
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
          <p className="text-xs text-muted-foreground max-w-[60%] italic">
            {t('factCheck.footerNotice')}
          </p>
          <Button onClick={() => handleFactCheck()} disabled={isPending || !claim.trim()} size="lg" className="px-8 shadow-md">
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            {t('factCheck.checkBtn')}
          </Button>
        </CardFooter>
      </Card>
      
      <AdBanner />

      <div ref={resultRef} className="scroll-mt-20">
        {isPending && <Card className="border-primary/10 shadow-lg"><CardHeader className="bg-muted/30"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-4 w-full mt-2" /></CardHeader><CardContent className="space-y-6 pt-6"><Skeleton className="h-20 w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" /><div className="space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></CardContent></Card>}
        {result && <FactCheckResultDisplay result={result} claim={claim} />}
      </div>

      <Card className="border-none bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-accent" />
            {t('factCheck.recentChecks')}
          </CardTitle>
          <CardDescription>{t('factCheck.recentChecksDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPublic ? <Skeleton className="h-24 w-full" /> : recentPublicChecks && recentPublicChecks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentPublicChecks.map((h: any) => {
                const config = verdictConfig[h.verdict as keyof typeof verdictConfig] || verdictConfig['Sem Evidência'];
                return (
                  <button key={h.id} className="p-4 text-left border rounded-xl hover:bg-white hover:shadow-md transition-all group bg-card flex flex-col justify-between h-full" onClick={() => { setClaim(h.claim); setResult(h); }}>
                    <p className="font-semibold italic text-xs line-clamp-3 mb-3 leading-snug">"{h.claim}"</p>
                    <Badge variant="outline" className={cn("text-[8px] uppercase tracking-wider border-none w-fit", config.badge)}>
                      {h.verdict}
                    </Badge>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground italic">{t('common.noResults')}</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed bg-muted/5">
        <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><History className="h-5 w-5 text-muted-foreground" />{t('factCheck.historyTitle')}</CardTitle><CardDescription>{t('factCheck.historyDesc')}</CardDescription></CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-10 bg-muted/20 rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground mb-4 font-medium">{t('common.login_prompt')}</p>
              <Button asChild variant="default" size="sm" className="shadow-sm"><Link href="/login">{t('nav.login')}</Link></Button>
            </div>
          ) : history && history.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {history.map((h: any) => {
                const config = verdictConfig[h.verdict as keyof typeof verdictConfig] || verdictConfig['Sem Evidência'];
                return (
                  <div key={h.id} className="p-5 border rounded-2xl hover:bg-white hover:shadow-md transition-all flex justify-between items-center group bg-card">
                    <div className="max-w-[75%]">
                      <p className="font-semibold italic text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">"{h.claim}"</p>
                      <Badge variant="outline" className={cn("text-[9px] uppercase tracking-wider border-none", config.badge)}>
                        {h.verdict}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-primary/5 hover:bg-primary/10" onClick={() => { setClaim(h.claim); setResult(h); }}>
                          <RefreshCw className="h-4 w-4 text-primary" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-destructive/10 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('common.warning')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('common.confirm_delete')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteHistory(h.id)} className="bg-destructive text-destructive-foreground">{t('common.delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <RefutationDialog contentId={`factcheck-${h.id}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/10">
              <HelpCircle className="mx-auto h-10 w-10 opacity-20 mb-3" />
              <p className="font-medium">{t('factCheck.noHistoryTitle')}</p>
              <p className="text-xs mt-1">{t('factCheck.noHistoryDesc')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
