'use client';

import { useState, useMemo, useRef, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, query, orderBy, addDoc, getDoc, doc, setDoc, where, limit, getDocs } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { getPublicStatistic, getChartFromRequest, getTranslation } from '@/lib/actions';
import { useTranslation, Language } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search, Bot, Loader2, BarChart3, Table as TableIcon, Download, Save, NotebookText, Maximize2, Zap, Info, PlusCircle, Languages, RefreshCw, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AdBanner } from '@/components/AdBanner';
import { RefutationDialog } from '@/components/RefutationDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { InfoPopover } from '@/components/InfoPopover';
import { safeDecode } from '@/lib/safe-decode';
import Link from 'next/link';

const MAX_CACHE_LENGTH = 1000;

interface DataPoint {
  label: string;
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

function generateSlug(text: string): string {
  if (!text) return '';
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 150);
}

function downloadCsv(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0] || {});
  const rows = data.map(obj => headers.map(h => `"${String(obj[h] || '').replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function transformToChartData(rawData: any[]): DataPoint[] {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) return [];
  
  const first = rawData[0];
  if (typeof first !== 'object' || first === null) return [];

  const keys = Object.keys(first);
  if (keys.includes('label') && keys.includes('value')) {
    return rawData.map(item => ({ ...item, label: String(item.label ?? 'N/A') })) as DataPoint[];
  }

  const labelKey = keys.find(k => /ano|date|year|mês|mes|month|categoria|category|país|country|tipo|type|entidade|label|nome|name|escala|size/i.test(k)) || keys[0];
  const valueKey = keys.find(k => /valor|value|total|taxa|rate|quantidade|amount|€|%|pib|gdp|índice|indice|médicos|doctors|empresas|companies/i.test(k)) 
    || keys.find(k => typeof first[k] === 'number') 
    || keys[1] 
    || keys[0];

  return rawData.map(item => ({
    ...item,
    label: String(item[labelKey] || 'N/A'),
    value: typeof item[valueKey] === 'number' 
      ? item[valueKey] 
      : parseFloat(String(item[valueKey] || '0').replace(/[^\d.,-]/g, '').replace(',', '.')) || 0
  }));
}

function ChartRenderer({ data, chartType, unit, height = 250 }: { data: DataPoint[], chartType: 'bar' | 'line', unit: string, height?: number }) {
  const chartData = useMemo(() => transformToChartData(data), [data]);
  const chartConfig: ChartConfig = {
    value: { label: unit || 'Value', color: 'hsl(var(--primary))' }
  };
  if (chartData.length === 0) return null;
  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height: `${height}px` }}>
      {chartType === 'line' ? (
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}${unit}`} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-value)' }} activeDot={{ r: 6 }} />
        </LineChart>
      ) : (
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}${unit}`} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ChartContainer>
  );
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
  const firestore = useFirestore();
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  
  const [isTranslating, startTransition] = useTransition();
  const [translated, setTranslated] = useState<{ title: string, desc: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  useEffect(() => {
    if (language === 'en' && (title || description)) {
      const checkCache = async () => {
        if (!firestore) return;
        const cacheRef = collection(firestore, 'translations_cache');
        const fetchCached = async (text: string) => {
          if (!text || text.length > MAX_CACHE_LENGTH) return null;
          const q = query(cacheRef, where('originalText', '==', text), where('targetLanguage', '==', 'English'), limit(1));
          const snap = await getDocs(q);
          return !snap.empty ? snap.docs[0].data().translatedText : null;
        };
        const [tTitle, tDesc] = await Promise.all([
          fetchCached(title),
          fetchCached(description)
        ]);
        if (tTitle || tDesc) {
          setTranslated({ title: tTitle || title, desc: tDesc || description });
          setShowOriginal(false);
        }
      };
      checkCache();
    } else {
      setTranslated(null);
      setShowOriginal(true);
    }
  }, [language, title, description, firestore]);

  const handleTranslate = () => {
    if (!firestore) return;
    startTransition(async () => {
      const resTitle = await getTranslation(title, language as Language);
      const resDesc = await getTranslation(description, language as Language);
      setTranslated({ title: resTitle, desc: resDesc });
      setShowOriginal(false);
      
      const cacheRef = collection(firestore, 'translations_cache');
      const saveToCache = (orig: string, trans: string) => {
        if (!orig || orig.length > MAX_CACHE_LENGTH) return;
        addDoc(cacheRef, { originalText: orig, translatedText: trans, targetLanguage: 'English', createdAt: serverTimestamp() });
      };
      saveToCache(title, resTitle);
      saveToCache(description, resDesc);
    });
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <Card className="border-dashed"><CardContent className="py-8 text-center text-muted-foreground italic">{t('explorer.noDataFound')}</CardContent></Card>;
  }

  const currentTitle = !showOriginal && translated ? translated.title : title;
  const currentDescription = !showOriginal && translated ? translated.desc : description;
  const headers = data?.[0] ? Object.keys(data[0]) : [];

  return (
    <Card className="overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{currentTitle}</CardTitle>
            <CardDescription className="mt-1 text-xs line-clamp-2">{currentDescription}</CardDescription>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {language !== 'pt' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
                disabled={isTranslating} 
                className="h-8 text-[10px] uppercase font-bold tracking-wider border-accent/50 text-accent hover:bg-accent/10 hover:text-accent"
              >
                {isTranslating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : translated ? <RefreshCw className="h-3.5 w-3.5" /> : <Languages className="h-3.5 w-3.5" />}
              </Button>
            )}
            <Button variant={viewMode === 'chart' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('chart')}><BarChart3 className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('table')}><TableIcon className="h-4 w-4" /></Button>
            <Dialog>
              <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Maximize2 className="h-4 w-4" /></Button></DialogTrigger>
              <DialogContent className="max-w-5xl w-[95vw] h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>{currentTitle}</DialogTitle>
                  {currentDescription && <DialogDescription>{currentDescription}</DialogDescription>}
                </DialogHeader>
                <div className="flex-1 min-h-0 py-6">
                  {viewMode === 'chart' ? <ChartRenderer data={data} chartType={chartType} unit={unit} height={450} /> : (
                    <div className="h-full overflow-auto rounded-md border">
                      <Table><TableHeader className="bg-muted/50 sticky top-0 z-10"><TableRow>{headers.map(h => <TableHead key={h} className="uppercase font-bold">{h}</TableHead>)}</TableRow></TableHeader>
                        <TableBody>{data.map((row, i) => (<TableRow key={i}>{headers.map((h, j) => (<TableCell key={j} className="text-base py-3">{String(row[h] !== undefined ? row[h] : '')}</TableCell>))}</TableRow>))}</TableBody>
                      </Table>
                    </div>
                  )}
                </div>
                <DialogFooter className="flex justify-between items-center sm:justify-between"><p className="text-xs text-muted-foreground italic">{t('explorer.sourceLabel')}: {source}</p><Button variant="outline" size="sm" onClick={() => downloadCsv(data, currentTitle)}><Download className="h-4 w-4 mr-2" />{t('explorer.exportCsv')}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => downloadCsv(data, currentTitle)}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-zoom-in relative group">
              <ChartRenderer data={data} chartType={chartType} unit={unit} />
              <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Badge variant="secondary" className="gap-1.5"><Maximize2 className="h-3 w-3" />{t('explorer.expandHint')}</Badge>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-[95vw] h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{currentTitle}</DialogTitle>
              {currentDescription && <DialogDescription>{currentDescription}</DialogDescription>}
            </DialogHeader>
            <div className="flex-1 min-h-0 py-6">
               <ChartRenderer data={data} chartType={chartType} unit={unit} height={450} />
            </div>
            <DialogFooter className="flex justify-between items-center sm:justify-between"><p className="text-xs text-muted-foreground italic">{t('explorer.sourceLabel')}: {source}</p><Button variant="outline" size="sm" onClick={() => downloadCsv(data, currentTitle)}><Download className="h-4 w-4 mr-2" />{t('explorer.exportCsv')}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter className="bg-muted/10 border-t py-2 flex justify-between items-center"><p className="text-[10px] text-muted-foreground italic">{t('explorer.sourceLabel')}: {source}</p><div className="flex gap-2">{showSave && <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold gap-1" onClick={onSave}><Save className="h-3 w-3" />{t('common.save')}</Button>}<RefutationDialog contentId={`data-${title}`} /></div></CardFooter>
    </Card>
  );
}

export default function ExplorerPage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [request, setRequest] = useState('');
  const [aiResponse, setAiResponse] = useState<UniversalData | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');

  const [isSuggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const [suggestUrl, setSuggestUrl] = useState('');
  const [suggestPurpose, setSuggestPurpose] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const processedRef = useRef<string | null>(null);

  const performSearch = useCallback(async (text: string) => {
    if (!text || !text.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    setNoResults(false);
    const humanText = safeDecode(text);
    setRequest(humanText);

    try {
      const docId = generateSlug(humanText);
      if (firestore) {
        const publicRef = doc(firestore, 'publicStatisticQueries', docId);
        const snap = await getDoc(publicRef);
        if (snap.exists()) {
          const cached = snap.data() as UniversalData;
          setAiResponse(cached);
          setIsAiLoading(false);
          return;
        }
      }

      const res = await getChartFromRequest({ request: humanText }, 'pt');
      let finalResult: UniversalData | null = null;

      if (res.isChartable && res.chartData && res.chartData.length > 0) {
        const chartData = res.chartData.map(d => ({ ...d, label: d.label ?? 'N/A', value: d.value ?? 0 })) as DataPoint[];
        finalResult = {
          title: res.chartTitle || humanText,
          description: res.explanation,
          source: t('explorer.aiSource'),
          unit: res.yAxisLabel,
          data: chartData,
          chartType: res.chartType as 'bar' | 'line' | undefined
        };
      } else {
        const statRes = await getPublicStatistic({ request: humanText }, 'pt');
        if (statRes.isFound && statRes.data) {
          const parsed = JSON.parse(statRes.data);
          const rawDataArray = Array.isArray(parsed) ? parsed : [parsed];
          const transformedData = transformToChartData(rawDataArray);

          finalResult = {
            title: humanText,
            description: statRes.explanation,
            source: statRes.source || t('explorer.officialSource'),
            data: transformedData,
            chartType: transformedData.length > 1 ? 'bar' : undefined
          };
        }
      }

      if (finalResult) {
        setAiResponse(finalResult);
        if (firestore) {
          setDoc(doc(firestore, 'publicStatisticQueries', docId), { ...finalResult, createdAt: serverTimestamp() }).catch(() => {});
        }
      } else {
        setNoResults(true);
      }
    } catch (e) {
      console.error(e);
      setNoResults(true);
    } finally {
      setIsAiLoading(false);
    }
  }, [firestore, t]);

  useEffect(() => {
    const raw = searchParams.get('request');
    if (raw && raw !== processedRef.current) {
      processedRef.current = raw;
      performSearch(raw);
    }
  }, [searchParams, performSearch]);

  const datasetsRef = useMemoFirebase(() => firestore ? collection(firestore, 'statisticalData') : null, [firestore]);
  const { data: datasets, isLoading } = useCollection<any>(datasetsRef);

  const sourcesRef = useMemoFirebase(() => firestore ? query(collection(firestore, 'dataSources'), where('isSystemSource', '==', true)) : null, [firestore]);
  const { data: officialSources } = useCollection<any>(sourcesRef);

  const savedViewsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'savedDataViews'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);
  const { data: savedViews } = useCollection<any>(savedViewsRef);

  const handleSave = async () => {
    if (!user || !aiResponse || !firestore) return;
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

  const handleSuggestSource = async () => {
    if (!user || !firestore || !suggestName.trim() || !suggestUrl.trim()) return;
    setIsSuggesting(true);
    try {
      await addDoc(collection(firestore, 'dataSources'), {
        name: suggestName,
        url: suggestUrl,
        description: suggestPurpose,
        type: 'Website',
        requiresAuth: false,
        authMethod: 'None',
        isSystemSource: false,
        submittedBy: user.uid,
        submittedByName: user.displayName,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      toast({ title: t('common.success'), description: t('explorer.suggestionSuccess') });
      setSuggestDialogOpen(false);
      setSuggestName(''); setSuggestUrl(''); setSuggestPurpose('');
    } catch (e) {
      toast({ variant: 'destructive', title: t('common.error') });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">{t('nav.explorer')}</h1>
            <p className="text-muted-foreground text-lg">{t('explorer.description')}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setSuggestDialogOpen(true)} disabled={!user}>
            <PlusCircle className="h-4 w-4" />
            {t('explorer.suggestSource')}
          </Button>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border border-muted flex gap-3 items-start mt-2">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">{t('explorer.howItWorks')}</p>
        </div>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="text-accent" />{t('explorer.aiCardTitle')}</CardTitle><CardDescription>{t('explorer.aiCardDesc')}</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder={t('explorer.textareaPlaceholder')} value={request} onChange={(e) => setRequest(e.target.value)} disabled={isAiLoading} className="text-lg" />
          <div>
            {isAiLoading && <div className="space-y-4 pt-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-[300px] w-full" /></div>}
            {noResults && !isAiLoading && (
              <div className="pt-4"><Card className="border-amber-200 bg-amber-50/50"><CardContent className="py-6 flex flex-col items-center gap-4 text-center"><p className="text-amber-800 font-medium">{t('explorer.noDataFound')}</p><p className="text-sm text-amber-700">{t('explorer.trySimulator')}</p><Button asChild variant="outline" className="border-amber-300 bg-white hover:bg-amber-100"><Link href={`/simulations?policy=${encodeURIComponent(request)}`}><Zap className="mr-2 h-4 w-4" />{t('explorer.goToSimulator')}</Link></Button></CardContent></Card></div>
            )}
            {aiResponse && !isAiLoading && <div className="mt-6 space-y-4"><UniversalDataCard {...aiResponse} showSave={!!user} onSave={() => { setSaveName(aiResponse.title); setSaveDesc(aiResponse.description); setSaveDialogOpen(true); }} /></div>}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 py-4 flex justify-between"><p className="text-xs text-muted-foreground italic max-w-[60%]">{t('explorer.officialFooter')}</p><Button onClick={() => performSearch(request)} disabled={isAiLoading || !request.trim()} size="lg" className="px-8">{isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}{t('explorer.searchBtn')}</Button></CardFooter>
      </Card>

      <AdBanner />

      {savedViews && savedViews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><NotebookText className="h-6 w-6 text-accent" />{t('explorer.mySavedViews')}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {savedViews.map(view => {
              try {
                const config = JSON.parse(view.viewConfiguration);
                return <UniversalDataCard 
                  key={view.id} 
                  {...config}
                  title={view.name}
                  description={view.description}
                />;
              } catch (e) {
                console.error("Failed to parse or render saved view:", view.id, e);
                return null;
              }
            })}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t('explorer.existingDataTitle')}</h2>
        {isLoading ? <Skeleton className="h-20 w-full" /> : (
          <div className="space-y-8">
            {datasets && Object.entries(datasets.reduce((acc: any, d: any) => {
              const cat = d.categoryKey ? t(d.categoryKey) : d.category || 'Geral';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(d);
              return acc;
            }, {})).map(([cat, ds]: any) => (
              <div key={cat} className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Badge variant="secondary">{cat}</Badge></h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {ds.map((d: any) => {
                    const title = d.titleKey ? t(d.titleKey) : d.title;
                    const description = d.descriptionKey ? t(d.descriptionKey) : d.description;
                    const source = d.sourceKey ? t(d.sourceKey) : d.source;

                    let dataArray = [];
                    try {
                      if (typeof d.data === 'string') {
                        dataArray = JSON.parse(d.data);
                      } else if (Array.isArray(d.data)) {
                        dataArray = d.data;
                      }
                    } catch (error) {
                      console.error('Failed to parse data for:', d.id, error);
                    }

                    const transformed = transformToChartData(dataArray);

                    return (
                      <UniversalDataCard 
                        key={d.id} 
                        title={title}
                        description={description || ''} 
                        source={source}
                        unit={title.includes('%') ? '%' : (title.includes('€') ? '€' : '')}
                        data={transformed} 
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <Globe className="h-6 w-6" /> {t('explorer.officialSourcesTitle')}
          </h2>
          <p className="text-muted-foreground">{t('explorer.officialSourcesDesc')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {officialSources?.map((source: any) => (
            <Card key={source.id} className="hover:shadow-md transition-all flex flex-col border-primary/5">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  {source.nameKey ? t(source.nameKey) : source.name}
                  <Link href={source.url} target="_blank" className="text-muted-foreground hover:text-primary"><ExternalLink className="h-3.5 w-3.5" /></Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
                  {source.descriptionKey ? t(source.descriptionKey) : source.description}
                </p>
              </CardContent>
              <CardFooter className="p-2 bg-muted/30 flex justify-center">
                <Button asChild variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold text-primary">
                  <Link href={source.url} target="_blank">{t('explorer.visitPortal')} <ExternalLink className="ml-1 h-2.5 w-2.5" /></Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('explorer.saveViewTitle')}</DialogTitle>
            <DialogDescription>{t('explorer.saveViewDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">{t('explorer.viewName')}</Label>
              <Input id="view-name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-desc">{t('explorer.viewDescription')}</Label>
              <Textarea id="view-desc" value={saveDesc} onChange={(e) => setSaveDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuggestDialogOpen} onOpenChange={setSuggestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('explorer.suggestSource')}</DialogTitle>
            <DialogDescription>{t('explorer.suggestSourceDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="source-name">{t('explorer.sourceName')}</Label>
              <Input id="source-name" placeholder={t('explorer.sourceNamePlaceholder')} value={suggestName} onChange={(e) => setSuggestName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-url">{t('explorer.sourceUrl')}</Label>
              <Input id="source-url" placeholder="https://..." value={suggestUrl} onChange={(e) => setSuggestUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-purpose">{t('explorer.sourcePurpose')}</Label>
              <Textarea id="source-purpose" placeholder={t('explorer.sourcePurposePlaceholder')} value={suggestPurpose} onChange={(e) => setSuggestPurpose(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleSuggestSource} disabled={isSuggesting || !suggestName.trim() || !suggestUrl.trim()}>{isSuggesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t('explorer.suggestBtn')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
