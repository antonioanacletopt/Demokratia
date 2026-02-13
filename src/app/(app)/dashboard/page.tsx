"use client";

import { useState, useTransition, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Loader2, Bot, Frown } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { DataSetKey, PublicData } from '@/lib/data';
import { getChartFromRequest } from '@/lib/actions';
import type { GenerateChartOutput } from '@/ai/flows/generate-chart-from-request';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

function DataSetChart({ dataSetKey }: { dataSetKey: DataSetKey }) {
  const firestore = useFirestore();
  const publicDataCollection = useMemoFirebase(() => collection(firestore, 'publicData'), [firestore]);
  const { data: publicData, isLoading } = useCollection<PublicData>(publicDataCollection);

  const dataSet = useMemo(() => {
    if (!publicData) return null;
    return publicData.find(d => d.id === dataSetKey);
  }, [publicData, dataSetKey]);

  const chartConfig = {
    value: {
      label: dataSet?.unit || '%',
      color: 'hsl(var(--primary))',
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!dataSet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dados não encontrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não foi possível carregar os dados para este gráfico. Tente carregar os dados na página 'Seed Data'.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dataSet.label}</CardTitle>
        <CardDescription>{dataSet.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={dataSet.data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(value) => `${value}${dataSet.unit}`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}


export default function DashboardPage() {
  const [request, setRequest] = useState('');
  const [chartResponse, setChartResponse] = useState<GenerateChartOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChartRequest = async () => {
    startTransition(async () => {
      setChartResponse(null);
      const result = await getChartFromRequest({ request });
      setChartResponse(result);
    });
  };

  const dynamicChartConfig = useMemo(() => {
    if (!chartResponse?.isChartable) return {};
    return {
      value: {
        label: chartResponse.yAxisLabel || '',
        color: 'hsl(var(--primary))',
      },
    };
  }, [chartResponse]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard Interativo</h1>
        <p className="text-muted-foreground">Peça à IA para gerar gráficos sobre dados económicos e sociais de Portugal.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-accent" />
            <span>Gerar Gráfico com IA</span>
          </CardTitle>
          <CardDescription>Descreva o gráfico que pretende visualizar. A IA tentará encontrar os dados e geri-lo para si.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: 'Evolução da taxa de desemprego jovem em Portugal desde 2015' ou 'Número de empresas criadas por ano na última década'"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleChartRequest} disabled={isPending || !request.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar Gráfico
          </Button>
        </CardFooter>
      </Card>

      {isPending && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      )}

      {chartResponse && (
        chartResponse.isChartable && chartResponse.chartData ? (
          <Card>
            <CardHeader>
              <CardTitle>{chartResponse.chartTitle}</CardTitle>
              <CardDescription>{chartResponse.explanation}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={dynamicChartConfig} className="h-[350px] w-full">
                {chartResponse.chartType === 'line' ? (
                  <LineChart data={chartResponse.chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickFormatter={(value) => `${value}${chartResponse.yAxisLabel || ''}`} tickLine={false} axisLine={false} tickMargin={8} />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
                  </LineChart>
                ) : (
                  <BarChart data={chartResponse.chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickFormatter={(value) => `${value}${chartResponse.yAxisLabel || ''}`} tickLine={false} axisLine={false} tickMargin={8} />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                  </BarChart>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        ) : (
          <Alert variant="destructive">
            <Frown className="h-4 w-4" />
            <AlertTitle>Não foi possível gerar o gráfico</AlertTitle>
            <AlertDescription>
              {chartResponse.explanation}
            </AlertDescription>
          </Alert>
        )
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Principais Indicadores Económicos</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DataSetChart dataSetKey="gdp" />
          <DataSetChart dataSetKey="unemployment" />
          <DataSetChart dataSetKey="inflation" />
        </div>
      </div>
    </div>
  );
}
