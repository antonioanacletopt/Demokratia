"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Zap, ArrowUp, ArrowDown, Info, Link as LinkIcon, GitCompareArrows, PlusCircle, XCircle } from 'lucide-react';
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
import { useTranslation } from '@/lib/i18n';
import { safeDecode } from '@/lib/safe-decode';

function SimulationResult({ simulation }: { simulation: EconomicPolicySimulationOutput }) {
    return (
        <div className="space-y-6">
             {simulation.isRealPolicy && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Política Real Identificada</AlertTitle>
                    <AlertDescription>
                      {simulation.source ? (
                        <Link href={simulation.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:underline">
                          <LinkIcon className="h-4 w-4" />
                          Ver Fonte Oficial
                        </Link>
                      ) : (
                        <p className="text-sm mt-2">A IA identificou esta como uma política real, mas não encontrou uma fonte oficial primária.</p>
                      )}
                    </AlertDescription>
                  </Alert>
              )}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="text-primary" />
                        <span>Sumário do Impacto</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{simulation.simulatedImpact}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Projeção de Indicadores Chave</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Indicador</TableHead>
                                <TableHead className="text-right">Valor Atual</TableHead>
                                <TableHead className="text-right">Valor Projetado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {simulation.keyIndicators.map((indicator) => (
                                <TableRow key={indicator.name}>
                                    <TableCell className="font-medium">{indicator.name}</TableCell>
                                    <TableCell className="text-right">{indicator.currentValue.toFixed(2)}{indicator.unit}</TableCell>
                                    <TableCell className="text-right font-semibold text-primary">{indicator.projectedValue.toFixed(2)}{indicator.unit}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Raciocínio da IA</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{simulation.reasoning}</p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function SimulatorPage() {
  const [policy1, setPolicy1] = useState('');
  const [policy2, setPolicy2] = useState('');
  const [simulation1, setSimulation1] = useState<EconomicPolicySimulationOutput | null>(null);
  const [simulation2, setSimulation2] = useState<EconomicPolicySimulationOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isComparing, setIsComparing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { language } = useTranslation();

  useEffect(() => {
    const policyFromQuery = searchParams.get('policy');
    if (policyFromQuery) {
      setPolicy1(safeDecode(policyFromQuery));
    }
  }, [searchParams]);

  useEffect(() => {
    if (simulation1 && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [simulation1]);

  const handleSimulate = () => {
    if (!policy1.trim()) return;

    if (isComparing && !policy2.trim()) {
        toast({
            variant: 'destructive',
            title: 'Política em falta',
            description: 'Por favor, descreva a segunda política que pretende comparar.',
        });
        return;
    }

    startTransition(async () => {
      setSimulation1(null);
      setSimulation2(null);

      if (isComparing && policy2.trim()) {
        const [result1, result2] = await Promise.all([
          getEconomicSimulation({ policyDescription: policy1 }, language),
          getEconomicSimulation({ policyDescription: policy2 }, language),
        ]);
        setSimulation1(result1);
        setSimulation2(result2);
      } else {
        const result1 = await getEconomicSimulation({ policyDescription: policy1 }, language);
        setSimulation1(result1);
      }
    });
  };
  
  const addComparison = () => {
      setIsComparing(true);
  }

  const removeComparison = () => {
      setIsComparing(false);
      setPolicy2('');
      setSimulation2(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Simulador de Políticas Económicas</h1>
        <p className="text-muted-foreground">Simule o impacto de uma política ou compare duas políticas lado a lado.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descreva a Política</CardTitle>
          <CardDescription>
            Introduza a proposta que pretende simular. A IA tentará identificar se é uma proposta real e simulará o seu impacto.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold">{isComparing ? 'Política 1' : 'Política a Simular'}</h3>
            <Textarea
              placeholder="Ex: 'Reduzir o IVA na restauração de 13% para 6%'"
              value={policy1}
              onChange={(e) => setPolicy1(e.target.value)}
              rows={4}
              disabled={isPending}
            />
          </div>
          {isComparing && (
            <div className="space-y-2 relative">
                <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 z-10" onClick={removeComparison}>
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
                <h3 className="font-semibold">Política 2 (Comparação)</h3>
                <Textarea
                placeholder="Ex: 'Aumentar o salário mínimo nacional para 1000€'"
                value={policy2}
                onChange={(e) => setPolicy2(e.target.value)}
                rows={4}
                disabled={isPending}
                />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <Button onClick={handleSimulate} disabled={isPending || !policy1.trim()}>
            {isComparing ? <GitCompareArrows className="mr-2 h-4 w-4" /> : <Zap className="mr-2 h-4 w-4" />}
            {isPending ? 'A simular...' : (isComparing ? 'Comparar Políticas' : 'Simular Impacto')}
          </Button>
          {!isComparing && (
              <Button variant="outline" size="sm" onClick={addComparison}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Comparação
              </Button>
          )}
        </CardFooter>
      </Card>
      
      <AdBanner />

      <div ref={resultRef} className="scroll-mt-20">
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

        {simulation1 && (
            <div className="space-y-6">
              <Separator />
               <div>
                  <h2 className="text-2xl font-bold font-headline tracking-tight">Resultados da Simulação</h2>
                  <p className="text-muted-foreground">Análise do impacto da{isComparing && simulation2 ? 's' : ''} política{isComparing && simulation2 ? 's' : ''} simulada{isComparing && simulation2 ? 's' : ''}.</p>
              </div>
            </div>
        )}


        {simulation1 && simulation2 && isComparing ? (
          // Comparison View
          <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-2">
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
        ) : simulation1 && (
          // Single Simulation View
          <SimulationResult simulation={simulation1} />
        )}
      </div>
    </div>
  );
}
