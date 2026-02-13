"use client";

import { useState, useTransition } from 'react';
import { Loader2, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { getEconomicSimulation } from '@/lib/actions';
import type { EconomicPolicySimulationOutput } from '@/ai/flows/simulate-economic-policy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

export default function SimulatorPage() {
  const [policy, setPolicy] = useState('');
  const [simulation, setSimulation] = useState<EconomicPolicySimulationOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSimulation = async () => {
    startTransition(async () => {
      setSimulation(null);
      const result = await getEconomicSimulation({ policyDescription: policy });
      setSimulation(result);
    });
  };

  const chartConfig = {
    current: { label: 'Atual', color: 'hsl(var(--muted-foreground))' },
    projected: { label: 'Projetado', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Simulador Económico</h1>
        <p className="text-muted-foreground">Simule o impacto de políticas económicas hipotéticas em Portugal.</p>
      </div>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Descreva a Política</CardTitle>
          <CardDescription>
            Introduza uma descrição em linguagem natural da política económica que deseja simular.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: 'Reduzir o IVA na restauração de 13% para 6%' ou 'Aumentar o salário mínimo nacional em 10%'"
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
            rows={4}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSimulation} disabled={isPending || !policy.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simular Impacto
          </Button>
        </CardFooter>
      </Card>

      {isPending && (
        <>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </>
      )}

      {simulation && (
        <>
          <Card className="lg:col-span-2">
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

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Indicadores Chave</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicador</TableHead>
                    <TableHead className="text-right">Valor Atual</TableHead>
                    <TableHead className="text-right">Valor Projetado</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulation.keyIndicators.map((indicator) => {
                    const change = indicator.projectedValue - indicator.currentValue;
                    return (
                      <TableRow key={indicator.name}>
                        <TableCell className="font-medium">{indicator.name}</TableCell>
                        <TableCell className="text-right">
                          {indicator.currentValue}{indicator.unit}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {indicator.projectedValue}{indicator.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`flex items-center justify-end gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                            {Math.abs(change).toFixed(2)}{indicator.unit}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Visualização</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={simulation.keyIndicators} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid horizontal={false} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tickMargin={8} width={120} />
                  <XAxis type="number" dataKey="projectedValue" hide />
                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="currentValue" name="Atual" fill="var(--color-current)" radius={4} />
                  <Bar dataKey="projectedValue" name="Projetado" fill="var(--color-projected)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Raciocínio Económico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{simulation.reasoning}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
