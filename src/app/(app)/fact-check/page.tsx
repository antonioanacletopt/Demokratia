"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { getFactCheck } from '@/lib/actions';
import type { FactCheckOutput } from '@/ai/flows/fact-check-claim';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ShieldCheck, History, User, FileText, Check, X, AlertTriangle, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdBanner } from '@/components/AdBanner';
import { useTranslation } from '@/lib/i18n';

const verdictConfig = {
  Verdadeiro: { icon: Check, color: 'bg-green-100 text-green-800' },
  Falso: { icon: X, color: 'bg-red-100 text-red-800' },
  Enganador: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800' },
  'Sem Evidência': { icon: HelpCircle, color: 'bg-gray-100 text-gray-800' },
};

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

  const VerdictIcon = result?.verdict ? (verdictConfig[result.verdict as keyof typeof verdictConfig]?.icon || HelpCircle) : null;

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
        {result && (
          <Card>
            <CardHeader><CardTitle>{t('factCheck.resultTitle')}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">{t('factCheck.verdict')}</h3>
                <div className={`flex items-center gap-2 p-3 rounded-md border ${result.verdict ? (verdictConfig[result.verdict as keyof typeof verdictConfig]?.color || '') : ''}`}>
                  {VerdictIcon && <VerdictIcon className="h-6 w-6" />}
                  <span className="font-bold">{result.verdict}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('factCheck.explanation')}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.explanation}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('factCheck.sources')}</h3>
                <ul className="space-y-1">
                  {result.sources.map((s, i) => <li key={i}><Link href={s} target="_blank" className="text-primary hover:underline text-sm break-all">{s}</Link></li>)}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
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
                <div key={h.id} className="p-4 border rounded-lg">
                  <p className="font-medium italic mb-2">"{h.claim}"</p>
                  <Badge>{h.verdict}</Badge>
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
