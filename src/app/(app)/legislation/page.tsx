
'use client';

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, doc, setDoc, query, where, limit, getDocs, orderBy, getDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { getLegislationInfo, getTranslation } from '@/lib/actions';
import type { ConsultLegislationOutput } from '@/ai/flows/consult-legislation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Scale, History, Bot, Sparkles, Languages, RefreshCw, Info, Trash2 } from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { useTranslation } from '@/lib/i18n';
import { RefutationDialog } from '@/components/RefutationDialog';
import { safeDecode } from '@/lib/safe-decode';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const MAX_CACHE_LENGTH = 1000;

interface LegislationQuery extends ConsultLegislationOutput {
  id: string;
  question: string;
  createdAt: any;
}

function generateSlug(text: string): string {
  if (!text) return '';
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 150);
}

function LegislationResultDisplay({ result, questionText }: { result: ConsultLegislationOutput, questionText: string }) {
  const { t, language } = useTranslation();
  const firestore = useFirestore();
  const [isTranslating, startTransition] = useTransition();
  const [translated, setTranslated] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  const questionId = generateSlug(questionText);

  useEffect(() => {
    if (language === 'en' && result) {
      const checkCache = async () => {
        const cacheRef = collection(firestore, 'translations_cache');
        
        const fetchCached = async (text: string) => {
          if (!text || text.length > MAX_CACHE_LENGTH) return null;
          const q = query(cacheRef, where('originalText', '==', text), where('targetLanguage', '==', 'English'), limit(1));
          const snap = await getDocs(q);
          return !snap.empty ? snap.docs[0].data().translatedText : null;
        };

        const tAnswer = await fetchCached(result.answer);
        if (tAnswer) {
          setTranslated(tAnswer);
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
      const res = await getTranslation(result.answer, language);
      setTranslated(res);
      setShowOriginal(false);

      if (result.answer.length <= MAX_CACHE_LENGTH) {
        const cacheRef = collection(firestore, 'translations_cache');
        setDoc(doc(cacheRef), {
          originalText: result.answer,
          translatedText: res,
          targetLanguage: language === 'en' ? 'English' : 'Portuguese',
          createdAt: serverTimestamp()
        });
      }
    });
  };

  const currentAnswer = !showOriginal && translated ? translated : result.answer;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3">
            <Bot className="h-6 w-6" />
            {t('legislation.resultTitle')}
          </CardTitle>
          <div className="flex gap-2">
            <RefutationDialog contentId={`legislation-${questionId}`} />
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
          <h3 className="font-semibold text-lg mb-2">{t('legislation.analysis')}</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{currentAnswer}</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{t('legislation.sources')}</h3>
          {result.sources.length > 0 ? (
            <ul className="space-y-2">
              {result.sources.map((source, index) => (
                <li key={index} className="text-sm">
                  <Link href={source} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                    {source}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LegislationPage() {
  const { t, language } = useTranslation();
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<ConsultLegislationOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const processedRef = useRef<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleConsultation = useCallback((customQuestion?: string) => {
    const textToUse = (customQuestion || question).trim();
    if (!textToUse || !firestore) return;
    
    const id = generateSlug(textToUse);

    startTransition(async () => {
      setResult(null);

      const publicRef = doc(firestore, 'publicLegislationQueries', id);
      const snap = await getDoc(publicRef);
      if (snap.exists()) {
        setResult(snap.data() as ConsultLegislationOutput);
        return;
      }

      const response = await getLegislationInfo({ question: textToUse }, language);
      setResult(response);

      setDoc(publicRef, { question: textToUse, ...response, createdAt: serverTimestamp() }, { merge: true });

      if (user) {
        const userHistoryRef = doc(firestore, 'users', user.uid, 'legislationQueries', id);
        setDoc(userHistoryRef, { question: textToUse, ...response, createdAt: serverTimestamp() }, { merge: true });
      }
    });
  }, [question, firestore, language, user]);

  useEffect(() => {
    const questionFromQuery = searchParams.get('question');
    if (questionFromQuery && questionFromQuery !== processedRef.current) {
      processedRef.current = questionFromQuery;
      const decoded = safeDecode(questionFromQuery);
      setQuestion(decoded);
      handleConsultation(decoded);
    }
  }, [searchParams, handleConsultation]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'legislationQueries'), orderBy('createdAt', 'desc'), limit(10));
  }, [firestore, user]);
  const { data: pastQueries } = useCollection<LegislationQuery>(historyQuery);

  const publicQueriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publicLegislationQueries'), orderBy('createdAt', 'desc'), limit(5));
  }, [firestore]);
  const { data: recentQueries } = useCollection<LegislationQuery>(publicQueriesQuery);

  const handleDeleteHistory = async (id: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'legislationQueries', id));
      toast({ title: t('common.success') });
    } catch (e) {
      toast({ variant: 'destructive', title: t('common.error') });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('legislation.title')}</h1>
        <p className="text-muted-foreground">{t('legislation.description')}</p>
        <div className="bg-muted/30 p-4 rounded-xl border border-muted flex gap-3 items-start mt-2">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('legislation.howItWorks')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            {t('legislation.cardTitle')}
          </CardTitle>
          <CardDescription>{t('legislation.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t('legislation.textareaPlaceholder')}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            disabled={isPending}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleConsultation()} disabled={isPending || !question.trim()}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scale className="mr-2 h-4 w-4" />}
            {t('legislation.consultBtn')}
          </Button>
        </CardFooter>
      </Card>
      
      <AdBanner />

      <div ref={resultRef} className="scroll-mt-20">
        {isPending && <Skeleton className="h-40 w-full" />}
        {result && <LegislationResultDisplay result={result} questionText={question} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            {t('legislation.recentQueries')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentQueries && recentQueries.length > 0 ? (
            <div className="space-y-4">
              {recentQueries.map(q => (
                <button key={q.id} className="w-full text-left rounded-lg border p-4 hover:bg-muted/50 transition-colors" onClick={() => { setQuestion(q.question); setResult(q); }}>
                  <p className="font-semibold text-muted-foreground italic">"{q.question}"</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('common.noResults')}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('legislation.historyTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? <p className="text-muted-foreground">{t('nav.login')}</p> : pastQueries && pastQueries.length > 0 ? (
            <div className="space-y-4">
              {pastQueries.map(q => (
                <div key={q.id} className="rounded-lg border p-4 flex justify-between items-center group hover:bg-muted/30 transition-colors">
                  <p className="font-semibold text-muted-foreground italic cursor-pointer" onClick={() => { setQuestion(q.question); setResult(q); }}>"{q.question}"</p>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
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
                          <AlertDialogAction onClick={() => handleDeleteHistory(q.id)} className="bg-destructive text-destructive-foreground">{t('common.delete')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <RefutationDialog contentId={`legislation-${q.id}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('legislation.noHistoryTitle')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
