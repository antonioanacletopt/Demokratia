'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, orderBy, where, serverTimestamp, addDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { getEconomicSimulation, type SimulationResult } from '@/lib/actions';
import { useTranslation, Language } from '@/lib/i18n';
import { 
  ThumbsUp, ThumbsDown, Sparkles, Zap, AlertTriangle,
  BarChart, ArrowDown, ArrowUp, Briefcase, Info, BookOpen, Loader2, User, Clock, Shield
} from 'lucide-react';
import { SocialShare } from '@/components/SocialShare';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// DIÁLOGO DE RESULTADOS DA SIMULAÇÃO (melhorado)
function SimulationResultsDialog({ results, t, policy }: { results: SimulationResult, t: (key: string) => string, policy: string }) {
  if (!results) return null;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/simulations?policy=${encodeURIComponent(policy)}`
    : '';

  return (
    <Card className="animate-fade-in shadow-lg mt-6 border-primary/20">
      <CardHeader className="bg-muted/30">
        <CardTitle>{results.title || t('simulations.results_title')}</CardTitle>
        <CardDescription>{t('simulations.results_summary')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{results.summary}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-green-600">
              <ArrowUp className="h-5 w-5" /> {t('simulations.results_positive')}
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              {results.positiveImpacts.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-red-600">
              <ArrowDown className="h-5 w-5" /> {t('simulations.results_negative')}
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              {results.negativeImpacts.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h3 className="font-semibold flex items-center gap-2 text-blue-600">
            <Briefcase className="h-5 w-5" /> {t('simulations.results_long_term')}
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{results.longTermOutlook}</p>
        </div>
        
        <div className="space-y-3 pt-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Info className="h-5 w-5" /> {t('simulations.results_assumptions')}
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            {results.assumptions.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
        
        <div className="space-y-3 pt-4">
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> {t('simulations.results_sources')}
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            {results.sources.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>

      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/30 p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-sm">
                <BarChart className="h-4 w-4" />
                <span className="font-bold">{t('simulations.results_confidence')}:</span>
                <Badge>{(results.confidenceScore * 100).toFixed(0)}%</Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t('simulations.results_confidence_desc')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-2">
          <SocialShare url={shareUrl} title={t('simulations.results_title')} description={policy.substring(0, 120)} />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{t('simulations.feedback_title')}</span>
            <Button variant="ghost" size="icon"><ThumbsUp className="h-4 w-4 text-green-500" /></Button>
            <Button variant="ghost" size="icon"><ThumbsDown className="h-4 w-4 text-red-500" /></Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// COMPONENTE PARA MOSTRAR A LISTA DE SIMULAÇÕES
function SimulationList({ simulations, isLoading, isAdmin, t }: any) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!simulations || simulations.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{t('simulations.no_simulations_title')}</AlertTitle>
        <AlertDescription>{t('simulations.no_simulations_desc')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {simulations.map((sim: any) => (
        <Card key={sim.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-base">{sim.policy}</CardTitle>
          </CardHeader>
          <CardFooter className="bg-muted/50 p-3 text-xs flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              {isAdmin && (
                <>
                  <User className="h-3 w-3" /> 
                  <span>{sim.userName || t('refutation.anonymous')}</span>
                  <Separator orientation="vertical" className="h-4" />
                </>
              )}
              <Clock className="h-3 w-3" />
              <span>{new Date(sim.createdAt.seconds * 1000).toLocaleDateString()}</span>
            </div>
            {/* Adicionar um botão para ver detalhes se necessário */}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default function SimulationsPage() {
  const { t, language } = useTranslation();
  const { user, isAdmin } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const [policy, setPolicy] = useState('');
  const [isSimulating, startSimulation] = useTransition();
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoTriggered, setAutoTriggered] = useState(false);

  // LÓGICA PARA BUSCAR SIMULAÇÕES EXISTENTES
  const simulationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const baseQuery = query(collection(firestore, 'simulations',), orderBy('createdAt', 'desc'));
    if (isAdmin) {
      return baseQuery; // Admin vê todas
    } else {
      return query(baseQuery, where('userId', '==', user.uid)); // Utilizador normal vê apenas as suas
    }
  }, [user, firestore, isAdmin]);

  const { data: simulations, isLoading } = useCollection(simulationsQuery);

  const handleSimulation = useCallback((overridePolicy?: string) => {
    const policyToUse = overridePolicy ?? policy;
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: t('common.error'), description: t('refutation.loginPrompt') });
        return;
    }
    if (!policyToUse.trim()) return;

    setError(null);
    setSimulationResult(null);
    startSimulation(async () => {
      try {
        const result = await getEconomicSimulation(policyToUse, language as Language);
        setSimulationResult(result);

        // Guarda a simulação no Firestore
        const simulationsCollection = collection(firestore, 'simulations');
        await addDoc(simulationsCollection, {
            userId: user.uid,
            userName: user.displayName,
            policy: policyToUse,
            resultSummary: result.summary, // Guardar um resumo
            confidenceScore: result.confidenceScore,
            createdAt: serverTimestamp()
        });

      } catch (e: any) {
        console.error(e);
        if (e.message && e.message.includes('permission-denied')) {
             setError(t('common.adminRequiredError'));
        } else if (e.message && e.message.includes('503')) {
          setError(t('common.aiUnavailableError'));
        } else {
          setError(t('common.genericError'));
        }
      }
    });
  }, [policy, user, firestore, language, t, toast]);

  // Auto-preenche e dispara simulação se vier ?policy= na URL
  useEffect(() => {
    const urlPolicy = searchParams.get('policy');
    if (urlPolicy && !autoTriggered) {
      const decoded = decodeURIComponent(urlPolicy);
      setPolicy(decoded);
      setAutoTriggered(true);
      // Aguarda um tick para o estado ser aplicado antes de disparar
      setTimeout(() => handleSimulation(decoded), 0);
    }
  }, [searchParams, autoTriggered, handleSimulation]);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-primary flex items-center justify-center gap-3">
            <Zap className="h-10 w-10" /> {t('simulations.title')}
          </h1>
          <p className="text-muted-foreground text-lg mt-2">{t('simulations.description')}</p>
        </div>

        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="policy-text" className="text-lg font-semibold">{t('simulations.input_label')}</Label>
              <Textarea 
                id="policy-text" 
                placeholder={t('simulations.input_placeholder')}
                rows={4}
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
                className="text-base" 
              />
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button onClick={handleSimulation} disabled={isSimulating || !policy.trim()} className="w-full md:w-auto ml-auto gap-2">
              {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 fill-current" />}
              {t('simulations.button_simulate')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSimulating && !simulationResult && (
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('simulations.simulating_message')}</p>
        </div>
      )}

      {simulationResult && <SimulationResultsDialog results={simulationResult} t={t} policy={policy} />}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            {isAdmin ? <Shield className="h-6 w-6 text-accent"/> : <Clock className="h-6 w-6 text-accent"/>}
            {isAdmin ? t('simulations.admin_view_title') : t('simulations.my_simulations_title')}
        </h2>
        <SimulationList simulations={simulations} isLoading={isLoading} isAdmin={isAdmin} t={t} />
      </div>

    </div>
  );
}
