'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { getEconomicSimulation, type SimulationResult } from '@/lib/actions';
import { useTranslation, Language } from '@/lib/i18n';
import { 
  ThumbsUp, ThumbsDown, Sparkles, Zap, AlertTriangle,
  BarChart, ArrowDown, ArrowUp, Briefcase, Info, BookOpen, Loader2 
} from 'lucide-react';

function SimulationResults({ results, t }: { results: SimulationResult, t: (key: string) => string }) {
  return (
    <Card className="animate-fade-in shadow-lg">
      <CardHeader>
        <CardTitle>{results.title}</CardTitle>
        <CardDescription>{t('simulations.results_summary')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{t('simulations.feedback_title')}</span>
          <Button variant="ghost" size="icon"><ThumbsUp className="h-4 w-4 text-green-500" /></Button>
          <Button variant="ghost" size="icon"><ThumbsDown className="h-4 w-4 text-red-500" /></Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SimulationsPage() {
  const { t, language } = useTranslation();
  const [policy, setPolicy] = useState('');
  const [isSimulating, startSimulation] = useTransition();
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulation = () => {
    setError(null);
    setSimulationResult(null);
    startSimulation(async () => {
      try {
        const result = await getEconomicSimulation(policy, language as Language);
        setSimulationResult(result);
      } catch (e: any) {
        if (e.message && e.message.includes('503')) {
          setError(t('common.aiUnavailableError'));
        } else {
          setError(t('common.genericError'));
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center">
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
          <Button onClick={handleSimulation} disabled={isSimulating || !policy} className="w-full md:w-auto ml-auto gap-2">
            {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 fill-current" />}
            {t('simulations.button_simulate')}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSimulating && (
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('simulations.simulating_message')}</p>
        </div>
      )}

      {simulationResult && <SimulationResults results={simulationResult} t={t} />}
    </div>
  );
}
