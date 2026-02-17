"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2, Bot, Frown, Save, User, NotebookText } from 'lucide-react';
import { doc, collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection, errorEmitter, FirestorePermissionError } from '@/firebase';
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AdBanner } from '@/components/AdBanner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

function DataSetChart({ dataSetKey }: { dataSetKey: DataSetKey }) {
  const firestore = useFirestore();
  
  const dataSetDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'publicData', dataSetKey);
  }, [firestore, dataSetKey]);

  const { data: dataSet, isLoading } = useDoc<PublicData>(dataSetDocRef);

  const chartConfig: ChartConfig = {
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// New interface for saved views
interface SavedDataView {
  id: string;
  name: string;
  description?: string;
  viewConfiguration: string; // JSON string of GenerateChartOutput
  createdAt: any;
  userId: string;
}

export default function DashboardPage() {
  const [request, setRequest] = useState('');
  const [chartResponse, setChartResponse] = useState<GenerateChartOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const savedViewsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'savedDataViews'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: savedViews, isLoading: isLoadingViews } = useCollection<SavedDataView>(savedViewsCollectionRef);

  useEffect(() => {
    if ((chartResponse || isPending) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [chartResponse, isPending]);

  const handleChartRequest = async () => {
    startTransition(async () => {
      setChartResponse(null);
      const result = await getChartFromRequest({ request });
      setChartResponse(result);
    });
  };

  const handleSaveView = async () => {
    if (!user || !firestore || !chartResponse) return;
    if (!newViewName.trim()) {
      toast({ variant: 'destructive', title: 'Nome em falta', description: 'Por favor, dê um nome à sua visualização.' });
      return;
    }
    
    setIsSaving(true);
    const savedViewsCollection = collection(firestore, 'users', user.uid, 'savedDataViews');
    
    const viewToSave = {
      userId: user.uid,
      name: newViewName,
      description: newViewDescription,
      viewConfiguration: JSON.stringify(chartResponse),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(savedViewsCollection, viewToSave);
      toast({ title: 'Visualização guardada!', description: 'O seu gráfico foi adicionado ao seu dashboard pessoal.' });
      setSaveDialogOpen(false);
      setNewViewName('');
      setNewViewDescription('');
    } catch (serverError) {
       const permissionError = new FirestorePermissionError({
          path: savedViewsCollection.path,
          operation: 'create',
          requestResourceData: viewToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Erro ao guardar', description: 'Não foi possível guardar a sua visualização.' });
    } finally {
      setIsSaving(false);
    }
  };

  const dynamicChartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    if (chartResponse?.isChartable) {
      config.value = {
        label: chartResponse.yAxisLabel || '',
        color: 'hsl(var(--primary))',
      };
    }
    return config;
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
        <CardFooter className="flex items-center justify-between">
          <Button onClick={handleChartRequest} disabled={isPending || !request.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar Gráfico
          </Button>
          {chartResponse?.isChartable && user && (
            <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar no Meu Dashboard
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Guardar Visualização</DialogTitle>
                  <DialogDescription>Dê um nome e uma descrição a este gráfico para o encontrar mais tarde.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="view-name">Nome</Label>
                    <Input id="view-name" value={newViewName} onChange={(e) => setNewViewName(e.target.value)} placeholder="Ex: Desemprego Jovem 2015-2023" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="view-description">Descrição (Opcional)</Label>
                    <Textarea id="view-description" value={newViewDescription} onChange={(e) => setNewViewDescription(e.target.value)} placeholder="Uma breve nota sobre este gráfico." />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleSaveView} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>

      <div ref={resultRef}>
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
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                      <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
                    </LineChart>
                  ) : (
                    <BarChart data={chartResponse.chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis tickFormatter={(value) => `${value}${chartResponse.yAxisLabel || ''}`} tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
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
      </div>

      <AdBanner />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">Meus Dashboards Guardados</h2>
        { !user && (
          <Card className="flex flex-col items-center justify-center text-center py-12">
            <CardHeader>
                <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <CardTitle className="mt-4">Inicie sessão para ver os seus dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Guarde gráficos gerados pela IA para criar o seu painel de controlo pessoal.</p>
              <Button asChild className="mt-4">
                <Link href="/login">Iniciar Sessão</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        { user && isLoadingViews && (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
             <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-4/5 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        )}
        { user && !isLoadingViews && savedViews && savedViews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {savedViews.map(view => {
              const savedChartResponse: GenerateChartOutput | null = JSON.parse(view.viewConfiguration);
              if (!savedChartResponse || !savedChartResponse.isChartable) return null;

              const savedChartConfig: ChartConfig = {
                value: { label: savedChartResponse.yAxisLabel || '', color: 'hsl(var(--primary))' }
              };
              
              return (
                <Card key={view.id}>
                  <CardHeader>
                    <CardTitle>{view.name}</CardTitle>
                    <CardDescription>{view.description || savedChartResponse.explanation}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={savedChartConfig} className="h-[350px] w-full">
                      {savedChartResponse.chartType === 'line' ? (
                        <LineChart data={savedChartResponse.chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis tickFormatter={(value) => `${value}${savedChartResponse.yAxisLabel || ''}`} tickLine={false} axisLine={false} tickMargin={8} />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                          <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
                        </LineChart>
                      ) : (
                        <BarChart data={savedChartResponse.chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis tickFormatter={(value) => `${value}${savedChartResponse.yAxisLabel || ''}`} tickLine={false} axisLine={false} tickMargin={8} />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                          <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                        </BarChart>
                      )}
                    </ChartContainer>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : user && !isLoadingViews && (
           <Card className="flex flex-col items-center justify-center text-center py-12">
            <CardHeader>
                <NotebookText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <CardTitle className="mt-4">Nenhuma visualização guardada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gere um gráfico com a IA e guarde-o para o ver aqui.</p>
            </CardContent>
          </Card>
        )}
      </div>

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
