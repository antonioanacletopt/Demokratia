
'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, addDoc, query, where, limit, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { getLegislationInfo } from '@/lib/actions';
import type { ConsultLegislationOutput } from '@/ai/flows/consult-legislation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Scale, History, User, FileText, Bot, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdBanner } from '@/components/AdBanner';
import { useTranslation } from '@/lib/i18n';

interface LegislationQuery extends ConsultLegislationOutput {
  id: string;
  question: string;
  createdAt: any; // Firestore Timestamp
}

interface PublicLegislationQuery extends ConsultLegislationOutput {
  id: string;
  question: string;
  createdAt: any;
}


export default function LegislationPage() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<ConsultLegislationOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useUser();
  const { language } = useTranslation();
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

  const legislationQueriesCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'legislationQueries');
  }, [firestore, user]);
  const { data: pastQueries, isLoading: isLoadingHistory } = useCollection<LegislationQuery>(legislationQueriesCollection);

  const publicQueriesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publicLegislationQueries'), orderBy('createdAt', 'desc'), limit(5));
  }, [firestore]);
  const { data: recentQueries, isLoading: isLoadingRecent } = useCollection<PublicLegislationQuery>(publicQueriesCollection);


  const handleConsultation = async () => {
    if (!question.trim() || !firestore) return;
    const trimmedQuestion = question.trim();

    startTransition(async () => {
      setResult(null);

      try {
        const q = query(collection(firestore, "publicLegislationQueries"), where("question", "==", trimmedQuestion), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const cachedDoc = querySnapshot.docs[0];
          const cachedResult = cachedDoc.data() as ConsultLegislationOutput;
          setResult(cachedResult);
          toast({ title: "Resposta encontrada na cache!", description: "Esta pergunta já foi respondida anteriormente." });
          
          const docRef = doc(firestore, "publicLegislationQueries", cachedDoc.id);
          updateDoc(docRef, { lastAccessedAt: serverTimestamp() }).catch(e => console.warn("Failed to update cache timestamp", e));
          
          return;
        }
      } catch (e) {
        console.error("Error checking public cache:", e);
        toast({ variant: "destructive", title: "Aviso", description: "Não foi possível verificar a cache. A contactar a IA diretamente."});
      }
      
      const response = await getLegislationInfo({ question: trimmedQuestion }, language);
      setResult(response);

      const publicCollection = collection(firestore, 'publicLegislationQueries');
      const cacheData = {
        question: trimmedQuestion,
        ...response,
        createdAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
      };
      addDoc(publicCollection, cacheData).catch(err => console.warn("Failed to write to public cache", err));

      if (user && legislationQueriesCollection) {
        const historyData = {
          userId: user.uid,
          question: trimmedQuestion,
          ...response,
          createdAt: serverTimestamp(),
        };
        addDoc(legislationQueriesCollection, historyData)
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: legislationQueriesCollection.path,
              operation: 'create',
              requestResourceData: historyData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
              variant: 'destructive',
              title: 'Erro ao guardar no histórico',
              description: 'Não foi possível guardar esta consulta no seu histórico.'
            })
          });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Consultar Legislação</h1>
        <p className="text-muted-foreground">Faça uma pergunta e a IA irá responder com base na legislação portuguesa em vigor.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Analisar Legislação
          </CardTitle>
          <CardDescription>
            Faça a sua pergunta em linguagem natural. A IA irá procurar a informação relevante e citar as fontes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: 'Sou emigrante com residência há 5 anos, posso pedir a nacionalidade portuguesa?' ou 'Quais são os meus direitos em caso de voo cancelado?'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            disabled={isPending}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleConsultation} disabled={isPending || !question.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Consultar Legislação
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
                <Bot className="h-6 w-6" />
                Resposta da Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Análise da Legislação</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.answer}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Fontes Oficiais</h3>
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
            <Sparkles className="h-5 w-5 text-accent" />
            Consultas Recentes da Comunidade
          </CardTitle>
          <CardDescription>Veja o que outros utilizadores andaram a perguntar.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRecent ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : recentQueries && recentQueries.length > 0 ? (
            <div className="space-y-4">
              {recentQueries.map(query => (
                <button 
                  key={query.id} 
                  className="w-full text-left rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  onClick={() => setQuestion(query.question)}
                >
                  <p className="font-semibold text-muted-foreground italic">"{query.question}"</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                Nenhuma consulta pública encontrada
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Seja o primeiro a fazer uma pergunta!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            O Meu Histórico de Consultas
          </CardTitle>
          {!user ? (
             <CardDescription className="!mt-2 flex items-center gap-2 text-amber-600">
              <User className="h-4 w-4" /> <span><Link href="/login" className="underline font-semibold">Inicie sessão</Link> para ver o seu histórico.</span>
            </CardDescription>
          ) : (
            <CardDescription>As suas consultas anteriores são guardadas aqui.</CardDescription>
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
                    As suas consultas serão guardadas aqui para referência futura.
                  </p>
                </div>
          )}
          {user && !isLoadingHistory && pastQueries && pastQueries.length > 0 ? (
            <div className="space-y-4">
              {pastQueries.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds).map(query => (
                  <div key={query.id} className="rounded-lg border p-4 space-y-2">
                    <p className="font-semibold text-muted-foreground italic">"{query.question}"</p>
                     <p className="text-xs text-muted-foreground pt-2">
                        Consultado em: {new Date(query.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                  </div>
              ))}
            </div>
          ) : user && !isLoadingHistory && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                Nenhuma consulta encontrada
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Use o formulário acima para fazer a sua primeira consulta.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
