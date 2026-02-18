'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, addDoc, query, where, limit, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { getLegislationInfo, getTranslation } from '@/lib/actions';
import type { ConsultLegislationOutput } from '@/ai/flows/consult-legislation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Scale, History, User, FileText, Bot, Sparkles, Languages, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdBanner } from '@/components/AdBanner';
import { useTranslation } from '@/lib/i18n';

interface LegislationQuery extends ConsultLegislationOutput {
  id: string;
  question: string;
  createdAt: any;
}

function LegislationResultDisplay({ result }: { result: ConsultLegislationOutput }) {
  const { t, language } = useTranslation();
  const firestore = useFirestore();
  const [isTranslating, startTransition] = useTransition();
  const [translated, setTranslated] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  useEffect(() => {
    if (language === 'en' && result) {
      const checkCache = async () => {
        const cacheRef = collection(firestore, 'translations_cache');
        const q = query(cacheRef, where('originalText', '==', result.answer), where('targetLanguage', '==', 'English'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setTranslated(snap.docs[0].data().translatedText);
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

      const cacheRef = collection(firestore, 'translations_cache');
      addDoc(cacheRef, {
        originalText: result.answer,
        translatedText: res,
        targetLanguage: language === 'en' ? 'English' : 'Portuguese',
        createdAt: serverTimestamp()
      });
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
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const questionFromQuery = searchParams.get('question');
    if (questionFromQuery) {
      setQuestion(decodeURIComponent(questionFromQuery.replace(/\+/g, ' ')));
    }
  }, [searchParams]);

  useEffect(() => {
    if ((result || isPending) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, isPending]);

  const historyQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'legislationQueries'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);
  const { data: pastQueries, isLoading: isLoadingHistory } = useCollection<LegislationQuery>(historyQuery);

  const publicQueriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publicLegislationQueries'), orderBy('createdAt', 'desc'), limit(5));
  }, [firestore]);
  const { data: recentQueries } = useCollection<LegislationQuery>(publicQueriesQuery);

  const handleConsultation = async () => {
    if (!question.trim() || !firestore) return;
    const trimmedQuestion = question.trim();

    startTransition(async () => {
      setResult(null);
      const response = await getLegislationInfo({ question: trimmedQuestion }, language);
      setResult(response);

      // Save to public cache and user history
      const publicRef = collection(firestore, 'publicLegislationQueries');
      addDoc(publicRef, { question: trimmedQuestion, ...response, createdAt: serverTimestamp() });

      if (user) {
        const userHistoryRef = collection(firestore, 'users', user.uid, 'legislationQueries');
        addDoc(userHistoryRef, { question: trimmedQuestion, ...response, createdAt: serverTimestamp() });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('legislation.title')}</h1>
        <p className="text-muted-foreground">{t('legislation.description')}</p>
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
          <Button onClick={handleConsultation} disabled={isPending || !question.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('legislation.consultBtn')}
          </Button>
        </CardFooter>
      </Card>
      
      <AdBanner />

      <div ref={resultRef}>
        {isPending && <Skeleton className="h-40 w-full" />}
        {result && <LegislationResultDisplay result={result} />}
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
                <button key={q.id} className="w-full text-left rounded-lg border p-4 hover:bg-muted/50" onClick={() => setQuestion(q.question)}>
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
                <div key={q.id} className="rounded-lg border p-4">
                  <p className="font-semibold text-muted-foreground italic">"{q.question}"</p>
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
