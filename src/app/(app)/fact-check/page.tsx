'use client';

import { useState, useTransition, useMemo, useEffect, useRef } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ShieldCheck, History, User, FileText, Check, X, AlertTriangle, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdBanner } from '@/components/AdBanner';

interface FactCheckResult extends FactCheckOutput {
  id: string;
  claim: string;
  createdAt: any; // Firestore Timestamp
}

const verdictConfig = {
  Verdadeiro: { icon: Check, color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800' },
  Falso: { icon: X, color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800' },
  Enganador: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800' },
  'Sem Evidência': { icon: HelpCircle, color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600' },
};

export default function FactCheckPage() {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState<FactCheckOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const claimFromQuery = searchParams.get('claim');
    if (claimFromQuery) {
      setClaim(decodeURIComponent(claimFromQuery.replace(/\+/g, ' ')));
    }
  }, [searchParams]);

  useEffect(() => {
    if ((result || isPending) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, isPending]);

  const factChecksCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'factChecks');
  }, [firestore, user]);

  const { data: pastChecks, isLoading: isLoadingHistory } = useCollection<FactCheckResult>(factChecksCollection);

  const handleFactCheck = async () => {
    if (!claim.trim()) return;

    startTransition(async () => {
      setResult(null);
      const response = await getFactCheck({ claim });
      setResult(response);

      if (user && factChecksCollection) {
        const historyData = {
          userId: user.uid,
          claim,
          ...response,
          createdAt: serverTimestamp(),
        };
        // Non-blocking write to history
        addDoc(factChecksCollection, historyData)
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: factChecksCollection.path,
              operation: 'create',
              requestResourceData: historyData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
              variant: 'destructive',
              title: 'Erro ao guardar no histórico',
              description: 'Não foi possível guardar esta verificação no seu histórico.'
            })
          });
      }
    });
  };

  const VerdictIcon = result?.verdict ? verdictConfig[result.verdict].icon : null;
  const verdictColor = result?.verdict ? verdictConfig[result.verdict].color : '';


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Verificação de Factos (Fact Check)</h1>
        <p className="text-muted-foreground">Introduza uma alegação e a IA irá analisá-la com base em fontes fidedignas.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Analisar uma Alegação
          </CardTitle>
          <CardDescription>
            Cole ou escreva a afirmação que pretende verificar. Seja o mais específico possível.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: 'O salário mínimo em Portugal é o mais baixo da Europa' ou 'A taxa de desemprego jovem duplicou no último ano.'"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            rows={4}
            disabled={isPending}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleFactCheck} disabled={isPending || !claim.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verificar Alegação
          </Button>
        </CardFooter>
      </Card>
      
      <AdBanner />

      <div ref={resultRef}>
        {isPending && (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-20 w-full mt-4" />
                   <Skeleton className="h-6 w-1/4 mt-4" />
                  <Skeleton className="h-12 w-full" />
              </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Resultado da Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Veredicto</h3>
                <div className={`flex items-center gap-2 rounded-md border p-3 ${verdictColor}`}>
                  {VerdictIcon && <VerdictIcon className="h-6 w-6" />}
                  <span className="text-lg font-bold">{result.verdict}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Explicação Detalhada</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.explanation}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Fontes Utilizadas</h3>
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
                  <p className="text-sm text-muted-foreground">Nenhuma fonte específica foi citada para esta análise.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Verificações
          </CardTitle>
          {!user ? (
             <CardDescription className="!mt-2 flex items-center gap-2 text-amber-600">
              <User className="h-4 w-4" /> <span><Link href="/login" className="underline font-semibold">Inicie sessão</Link> para ver o seu histórico.</span>
            </CardDescription>
          ) : (
            <CardDescription>As suas verificações anteriores são guardadas aqui.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingHistory && user && (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          {!user && !isLoadingHistory && (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                  <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                    Inicie sessão para ver o seu histórico
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    As suas verificações serão guardadas aqui para referência futura.
                  </p>
                </div>
          )}
          {user && !isLoadingHistory && pastChecks && pastChecks.length > 0 ? (
            <div className="space-y-4">
              {pastChecks.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds).map(check => {
                const VerdictIcon = verdictConfig[check.verdict]?.icon || HelpCircle;
                const verdictColor = verdictConfig[check.verdict]?.color || verdictConfig['Sem Evidência'].color;
                return (
                  <div key={check.id} className="rounded-lg border p-4">
                    <p className="font-semibold text-muted-foreground italic">"{check.claim}"</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge className={verdictColor}>
                        <VerdictIcon className="mr-1.5 h-4 w-4" />
                        {check.verdict}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Verificado em: {new Date(check.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : user && !isLoadingHistory && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                Nenhuma verificação encontrada
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Use o formulário acima para fazer a sua primeira verificação de factos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
