
"use client";

import { useState, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Zap, ArrowUp, ArrowDown, Info, Link as LinkIcon, GitCompareArrows } from 'lucide-react';
import Link from 'next/link';
import { getEconomicSimulation } from '@/lib/actions';
import type { EconomicPolicySimulationOutput } from '@/ai/flows/simulate-economic-policy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdBanner } from '@/components/AdBanner';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function SimulatorPage() {
  const [policy1, setPolicy1] = useState('');
  const [policy2, setPolicy2] = useState('');
  const [simulation1, setSimulation1] = useState<EconomicPolicySimulationOutput | null>(null);
  const [simulation2, setSimulation2] = useState<EconomicPolicySimulationOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const policyFromQuery = searchParams.get('policy');
    if (policyFromQuery) {
      setPolicy1(decodeURIComponent(policyFromQuery));
    }
  }, [searchParams]);

  const handleComparison = () => {
    if (!policy1.trim() || !policy2.trim()) {
      toast({
        variant: 'destructive',
        title: 'Políticas em falta',
        description: 'Por favor, descreva as duas políticas que pretende comparar.',
      });
      return;
    }
    startTransition(async () => {
      setSimulation1(null);
      setSimulation2(null);
      const [result1, result2] = await Promise.all([
        getEconomicSimulation({ policyDescription: policy1 }),
        getEconomicSimulation({ policyDescription: policy2 }),
      ]);
      setSimulation1(result1);
      setSimulation2(result2);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Comparador de Políticas Económicas</h1>
        <p className="text-muted-foreground">Simule o impacto de duas políticas e compare os resultados lado a lado.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descreva as Políticas a Comparar</CardTitle>
          <CardDescription>
            Introduza uma política em cada caixa. A IA tentará identificar se são propostas reais e simulará o seu impacto.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold">Política 1</h3>
            <Textarea
              placeholder="Ex: 'Reduzir o IVA na restauração de 13% para 6%'"
              value={policy1}
              onChange={(e) => setPolicy1(e.target.value)}
              rows={4}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Política 2</h3>
            <Textarea
              placeholder="Ex: 'Aumentar o salário mínimo nacional para 1000€'"
              value={policy2}
              onChange={(e) => setPolicy2(e.target.value)}
              rows={4}
              disabled={isPending}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleComparison} disabled={isPending || !policy1.trim() || !policy2.trim()}>
            <GitCompareArrows className="mr-2 h-4 w-4" />
            {isPending ? 'A comparar...' : 'Comparar Impacto'}
          </Button>
        </CardFooter>
      </Card>
      
      <AdBanner />

      {isPending && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {simulation1 && simulation2 && (
        <div className="space-y-6">
            <Separator />
            <div>
                <h2 className="text-2xl font-bold font-headline tracking-tight">Resultados da Comparação</h2>
                <p className="text-muted-foreground">Análise comparativa do impacto das políticas simuladas.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {simulation1.isRealPolicy && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Política 1 Real Identificada</AlertTitle>
                    <AlertDescription>
                      {simulation1.source && (
                        <Link href={simulation1.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:underline">
                          <LinkIcon className="h-4 w-4" />
                          Ver Fonte Oficial
                        </Link>
                      )}
                    </AlertDescription>
                  </Alert>
              )}
               {!simulation1.isRealPolicy && <div />}
              
              {simulation2.isRealPolicy && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Política 2 Real Identificada</AlertTitle>
                    <AlertDescription>
                      {simulation2.source && (
                        <Link href={simulation2.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:underline">
                          <LinkIcon className="h-4 w-4" />
                          Ver Fonte Oficial
                        </Link>
                      )}
                    </AlertDescription>
                  </Alert>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="text-primary" />
                            <span>Sumário (Política 1)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{simulation1.simulatedImpact}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="text-primary" />
                            <span>Sumário (Política 2)</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{simulation2.simulatedImpact}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Comparação de Indicadores Chave</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Indicador</TableHead>
                                <TableHead className="text-right">Política 1 (Projetado)</TableHead>
                                <TableHead className="text-right">Política 2 (Projetado)</TableHead>
                                <TableHead className="text-right">Diferença (P2 vs P1)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {simulation1.keyIndicators.map((indicator1, index) => {
                                const indicator2 = simulation2.keyIndicators[index];
                                if (!indicator2 || indicator1.name !== indicator2.name) return null;
                                const diff = indicator2.projectedValue - indicator1.projectedValue;
                                return (
                                    <TableRow key={indicator1.name}>
                                        <TableCell className="font-medium">{indicator1.name}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {indicator1.projectedValue.toFixed(2)}{indicator1.unit}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-primary">
                                            {indicator2.projectedValue.toFixed(2)}{indicator2.unit}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={`flex items-center justify-end gap-1 ${diff === 0 ? 'text-muted-foreground' : diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {diff !== 0 && (diff > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                                                {diff === 0 ? '-' : `${Math.abs(diff).toFixed(2)}${indicator1.unit}`}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Raciocínio (Política 1)</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{simulation1.reasoning}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Raciocínio (Política 2)</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{simulation2.reasoning}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
