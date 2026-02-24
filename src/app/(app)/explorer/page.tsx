"use client";

import { useState, useMemo, useRef, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, doc, setDoc, query, orderBy, where, limit, getDocs, addDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { getPublicStatistic, getChartFromRequest, getTranslation } from '@/lib/actions';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search, Bot, Loader2, BarChart3, Table as TableIcon, Download, RefreshCw, Languages, Save, NotebookText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AdBanner } from '@/components/AdBanner';
import { RefutationDialog } from '@/components/RefutationDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface DataPoint {
  label: string | number;
  value: number;
  [key: string]: any;
}

interface UniversalData {
  title: string;
  description: string;
  source: string;
  unit?: string;
  data: DataPoint[];
  chartType?: 'bar' | 'line';
}

function convertToCsv(data: any[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(h => `"${String(obj[h]).replace(/"/g, '""')}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function downloadCsv(data: any[], filename: string) {
  const csv = convertToCsv(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function UniversalDataCard({ 
  title, 
  description, 
  source, 
  data, 
  unit = '', 
  chartType = 'bar',
  showSave = false,
  onSave = () => {}
}: UniversalData & { showSave?: boolean, onSave?: () => void }) {
  const { t, language } = useTranslation();
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  
  const chartConfig: ChartConfig = {
    value: { label: unit || 'Valor', color: 'hsl(var(--primary))' }
  };

  return (
    <Card className="overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{title}</CardTitle>
            <CardDescription className="mt-1 text-xs line-clamp-2">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant={viewMode === 'chart' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('chart')}><BarChart3 className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('table')}><TableIcon className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => downloadCsv(data, title)}><Download className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {viewMode === 'chart' ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            {chartType === 'line' ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}${unit}`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-value)' }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}${unit}`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ChartContainer>
        ) : (
          <div className="overflow-x-auto rounded-md border max-h-[250px]">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10"><TableRow>{Object.keys(data[0] || {}).map(h => <TableHead key={h} className="text-[10px] uppercase font-bold">{h}</TableHead>)}</TableRow></TableHeader>
              <TableBody>{data.map((row, i) => (<TableRow key={i}>{Object.values(row).map((v, j) => (<TableCell key={j} className="text-sm py-2">{String(v)}</TableCell>))}</TableRow>))}</TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/10 border-t py-2 flex justify-between items-center">
        <p className="text-[10px] text-muted-foreground italic">Fonte: {source}</p>
        <div className="flex gap-2">
          {showSave && <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold gap-1" onClick={onSave}><Save className="h-3 w-3" />Guardar</Button>}
          <RefutationDialog contentId={`data-${title}`} />
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ExplorerPage() {
  const { t, language } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [request, setRequest] = useState('');
  const [aiResponse, setAiResponse] = useState<UniversalData | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveNameDesc] = useState('');
  
  const resultRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<string | null>(null);

  const performSearch = useCallback(async (text: string) => {
    if (!text || !text.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    setRequest(text);

    try {
      // Tentar gerar gráfico primeiro pois é mais visual para o novo explorador
      const res = await getChartFromRequest({ request: text });
      if (res.isChartable && res.chartData) {
        setAiResponse({
          title: res.chartTitle || 'Dados de IA',
          description: res.explanation,
          source: 'Análise IA via Fontes Oficiais',
          unit: res.yAxisLabel,
          data: res.chartData,
          chartType: res.chartType
        });
      } else {
        // Fallback para estatística pura se não for "chartable"
        const statRes = await getPublicStatistic({ request: text });
        if (statRes.isFound && statRes.data) {
          const parsed = JSON.parse(statRes.data);
          setAiResponse({
            title: text,
            description: statRes.explanation,
            source: statRes.source || 'Fontes Oficiais',
            data: Array.isArray(parsed) ? parsed : [parsed]
          });
        }
      }
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  useEffect(() => {
    const raw = searchParams.get('request');
    if (raw && raw !== processedRef.current) {
      processedRef.current = raw;
      const decoded = decodeURIComponent(raw.replace(/\+/g, ' '));
      performSearch(decoded);
    }
  }, [searchParams, performSearch]);

  const datasetsRef = useMemoFirebase(() => collection(firestore, 'statisticalData'), [firestore]);
  const { data: datasets, isLoading } = useCollection<any>(datasetsRef);

  const savedViewsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'savedDataViews'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);
  const { data: savedViews } = useCollection<any>(savedViewsRef);

  const handleSave = async () => {
    if (!user || !aiResponse) return;
    try {
      await addDoc(collection(firestore, 'users', user.uid, 'savedDataViews'), {
        userId: user.uid,
        name: saveName || aiResponse.title,
        description: saveDesc || aiResponse.description,
        viewConfiguration: JSON.stringify(aiResponse),
        createdAt: serverTimestamp()
      });
      toast({ title: t('common.success') });
      setSaveDialogOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: t('common.error') });
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">{t('explorer.title')}</h1>
        <p className="text-muted-foreground text-lg">{t('explorer.description')}</p>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="text-accent" />Perguntar à IA</CardTitle>
          <CardDescription>Gere gráficos ou tabelas sobre qualquer tema económico ou social de Portugal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Ex: 'Evolução da dívida pública nos últimos 10 anos' ou 'Distribuição de empresas por setor'" 
            value={request} 
            onChange={(e) => setRequest(e.target.value)} 
            disabled={isAiLoading}
            className="text-lg"
          />
          <div ref={resultRef} className="scroll-mt-20">
            {isAiLoading && <div className="space-y-4 pt-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-[300px] w-full" /></div>}
            {aiResponse && !isAiLoading && (
              <div className="mt-6 space-y-4">
                <UniversalDataCard 
                  {...aiResponse} 
                  showSave={!!user} 
                  onSave={() => { setSaveName(aiResponse.title); setSaveDialogOpen(true); }} 
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 py-4 flex justify-between">
          <p className="text-xs text-muted-foreground italic max-w-[60%]">Os dados são extraídos de portais oficiais (INE, Pordata, DGO) via IA.</p>
          <Button onClick={() => performSearch(request)} disabled={isAiLoading || !request.trim()} size="lg" className="px-8">
            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Explorar
          </Button>
        </CardFooter>
      </Card>

      <AdBanner />

      {savedViews && savedViews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><NotebookText className="h-6 w-6 text-accent" />{t('dashboard.savedTitle')}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {savedViews.map(view => {
              const config = JSON.parse(view.viewConfiguration);
              return <UniversalDataCard key={view.id} {...config} title={view.name} description={view.description} />;
            })}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t('explorer.existingDataTitle')}</h2>
        {isLoading ? <Skeleton className="h-20 w-full" /> : (
          <div className="space-y-8">
            {datasets && Object.entries(datasets.reduce((acc: any, d: any) => {
              const cat = d.category || 'Geral';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(d);
              return acc;
            }, {})).map(([cat, ds]: any) => (
              <div key={cat} className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Badge variant="secondary">{cat}</Badge></h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {ds.map((d: any) => {
                    const parsedData = typeof d.data === 'string' ? JSON.parse(d.data) : d.data;
                    // Adaptar dados de tabela para gráfico se possível (Ano/Valor)
                    const chartFriendlyData = Array.isArray(parsedData) ? parsedData.map(item => ({
                      label: item.Ano || item.Ano || Object.values(item)[0],
                      value: parseFloat(String(item.Valor || item['Ganho Médio (€)'] || item['Dívida (% PIB)'] || Object.values(item)[1]).replace('%', '')) || 0
                    })) : [];

                    return (
                      <UniversalDataCard 
                        key={d.id}
                        title={d.title}
                        description={d.description}
                        source={d.source}
                        unit={d.title.includes('%') ? '%' : '€'}
                        data={chartFriendlyData.length > 0 ? chartFriendlyData : parsedData}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Guardar no Meu Dashboard</DialogTitle><DialogDescription>Dê um nome e descrição para esta visualização personalizada.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nome da Visualização</Label><Input value={saveName} onChange={(e) => setSaveName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Descrição Opcional</Label><Textarea value={saveDesc} onChange={(e) => setSaveNameDesc(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
