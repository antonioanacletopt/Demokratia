"use client";

import { useState, useTransition } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Loader2, Lightbulb } from 'lucide-react';
import { publicDataSets, DataSetKey } from '@/lib/data';
import { getDataExplanation } from '@/lib/actions';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DataSetKey>('gdp');
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleExplanation = async () => {
    startTransition(async () => {
      const currentData = publicDataSets[activeTab];
      const contextData = `Data: ${currentData.label}\nDescription: ${currentData.description}\nValues: ${JSON.stringify(currentData.data)}`;
      
      const result = await getDataExplanation({ question, contextData });
      setExplanation(result.explanation);
    });
  };

  const chartConfig = {
    value: {
      label: publicDataSets[activeTab].unit,
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard de Dados Públicos</h1>
          <p className="text-muted-foreground">Explore dados económicos e sociais de Portugal.</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DataSetKey)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gdp">PIB</TabsTrigger>
          <TabsTrigger value="unemployment">Desemprego</TabsTrigger>
          <TabsTrigger value="inflation">Inflação</TabsTrigger>
        </TabsList>
        {Object.keys(publicDataSets).map((key) => {
          const dataSet = publicDataSets[key as DataSetKey];
          return (
            <TabsContent key={key} value={key}>
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
            </TabsContent>
          );
        })}
      </Tabs>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-accent" />
            <span>Explorar com IA</span>
          </CardTitle>
          <CardDescription>Faça uma pergunta sobre os dados selecionados para obter uma explicação gerada por IA.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: Qual a tendência do PIB nos últimos 3 anos e porquê?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
           {isPending && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
           )}
          {explanation && !isPending && (
            <Alert>
              <AlertTitle>Análise da IA</AlertTitle>
              <AlertDescription>
                {explanation}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleExplanation} disabled={isPending || !question.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar Explicação
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
