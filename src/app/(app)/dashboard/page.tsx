"use client";

import { useState, useTransition, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2, Bot, Frown, Save, User, NotebookText, Languages, RefreshCw } from 'lucide-react';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, where, limit, getDocs } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection, errorEmitter, FirestorePermissionError } from '@/firebase';
import { DataSetKey, PublicData } from '@/lib/data';
import { getChartFromRequest, getTranslation } from '@/lib/actions';
import type { GenerateChartOutput } from '@/ai/flows/generate-chart-from-request';
import { useTranslation } from '@/lib/i18n';

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
import { RefutationDialog } from '@/components/RefutationDialog';

const MAX_CACHE_LENGTH = 1000;

function DataSetChart({ dataSetKey }: { dataSetKey: DataSetKey }) {
  const { t, language } = useTranslation();
  const firestore = useFirestore();
  const [isTranslating, startTransition] = useTransition();
  const [translated, setTranslated] = useState<{ title: string, desc: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  
  const dataSetDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'publicData', dataSetKey);
  }, [firestore, dataSetKey]);

  const { data: dataSet, isLoading } = useDoc<PublicData>(dataSetDocRef);

  useEffect(() => {
    if (language === 'en' && dataSet) {
      const checkCache = async () => {
        const cacheRef = collection(firestore, 'translations_cache');
        const targetLang = 'English';
        
        const fetchCached = async (text: string) => {
          if (!text || text.length > MAX_CACHE_LENGTH) return null;
          const q = query(cacheRef, where('originalText', '==', text), where('targetLanguage', '==', targetLang), limit(1));
          const snap = await getDocs(q);
          return !snap.empty ? snap.docs[0].data().translatedText : null;
        };

        const [tTitle, tDesc] = await Promise.all([
          fetchCached(dataSet.label),
          fetchCached(dataSet.description)
        ]);

        if (tTitle && tDesc) {
          setTranslated({ title: tTitle, desc: tDesc });
          setShowOriginal(false);
        }
      };
      checkCache();
    } else {
      setTranslated(null);
      setShowOriginal(true);
    }
  }, [language, dataSet, firestore]);

  const handleTranslate = () => {
    if (!dataSet) return;
    startTransition(async () => {
      const resTitle = await getTranslation(dataSet.label, language);
      const resDesc = await getTranslation(dataSet.description, language);
      
      setTranslated({ title: resTitle, desc: resDesc });
      setShowOriginal(false);

      const cacheRef = collection(firestore, 'translations_cache');
      const targetLang = language === 'en' ? 'English' : 'Portuguese';
      
      if (dataSet.label.length <= MAX_CACHE_LENGTH) {
        addDoc(cacheRef, {
          originalText: dataSet.label,
          translatedText: resTitle,
          targetLanguage: targetLang,
          createdAt: serverTimestamp()
        });
      }
      if (dataSet.description.length <= MAX_CACHE_LENGTH) {
        addDoc(cacheRef, {
          originalText: dataSet.description,
          translatedText: resDesc,
          targetLanguage: targetLang,
          createdAt: serverTimestamp()
        });
      }
    });
  };

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
          <CardTitle>{t('dashboard.dataNotFound')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('dashboard.seedNotice')}</p>
        </CardContent>
      </Card>
    );
  }

  const currentTitle = !showOriginal && translated ? translated.title : dataSet.label;
  const currentDesc = !showOriginal && translated ? translated.desc : dataSet.description;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{currentTitle}</CardTitle>
            <CardDescription className="mt-1">{currentDesc}</CardDescription>
          </div>
          {language !== 'pt' && (
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
                disabled={isTranslating}
                className="h-8 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary shrink-0"
            >
                {isTranslating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : translated ? <RefreshCw className="mr-1 h-3 w-3" /> : <Languages className="mr-1 h-3 w-3" />}
                {isTranslating ? t('common.translating') : (translated ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate'))}
            </Button>
          )}
        </div>
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

interface SavedDataView {
  id: string;
  name: string;
  description?: string;
  viewConfiguration: string;
  createdAt: any;
  userId: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [request, setRequest] = useState('');
  const [chartResponse, setChartResponse] = useState<GenerateChartOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const handleChartRequest = useCallback((customRequest?: string) => {
    const requestToUse = (customRequest || request).trim();
    if (!requestToUse) return;

    startTransition(async () => {
      setChartResponse(null);
      const result = await getChartFromRequest({ request: requestToUse });
      setChartResponse(result);
    });
  }, [request]);

  useEffect(() => {
    const queryFromUrl = searchParams.get('request');
    if (queryFromUrl) {
      const decoded = decodeURIComponent(queryFromUrl);
      setRequest(decoded);
      handleChartRequest(decoded);
    }
  }, [searchParams, handleChartRequest]);

  useEffect(() => {
    if (chartResponse && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [chartResponse]);

  const savedViewsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'savedDataViews'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: savedViews, isLoading: isLoadingViews } = useCollection<SavedDataView>(savedViewsCollectionRef);

  const handleSaveView = async () => {
    if (!user || !firestore || !chartResponse) return;
    if (!newViewName.trim()) {
      toast({ variant: 'destructive', title: t('common.error'), description: 'Por favor, dê um nome à sua visualização.' });
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
      toast({ title: t('common.success'), description: 'Visualização guardada!' });
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
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.description')}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-accent" />
            <span>{t('dashboard.aiCardTitle')}</span>
          </CardTitle>
          <CardDescription>{t('dashboard.aiCardDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t('dashboard.textareaPlaceholder')}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button onClick={() => handleChartRequest()} disabled={isPending || !request.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('dashboard.generateBtn')}
          </Button>
          {chartResponse?.isChartable && user && (
            <div className="flex gap-2">
              <RefutationDialog contentId={`chart-${chartResponse.chartTitle}`} />
              <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    {t('dashboard.saveToDash')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('dashboard.saveDialogTitle')}</DialogTitle>
                    <DialogDescription>{t('dashboard.saveDialogDesc')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="view-name">{t('dashboard.viewName')}</Label>
                      <Input id="view-name" value={newViewName} onChange={(e) => setNewViewName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="view-description">{t('dashboard.viewDescription')}</Label>
                      <Textarea id="view-description" value={newViewDescription} onChange={(e) => setNewViewDescription(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">{t('common.cancel')}</Button>
                    </DialogClose>
                    <Button onClick={handleSaveView} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('common.save')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardFooter>
      </Card>

      <div ref={resultRef} className="scroll-mt-20">
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
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{chartResponse.chartTitle}</CardTitle>
                    <CardDescription>{chartResponse.explanation}</CardDescription>
                  </div>
                  <RefutationDialog contentId={`chart-${chartResponse.chartTitle}`} />
                </div>
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
              <AlertTitle>{t('common.error')}</AlertTitle>
              <AlertDescription>
                {chartResponse.explanation}
              </AlertDescription>
            </Alert>
          )
        )}
      </div>

      <AdBanner />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('dashboard.savedTitle')}</h2>
        {!user ? (
          <Card className="flex flex-col items-center justify-center text-center py-12">
            <CardHeader>
                <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <CardTitle className="mt-4">{t('nav.login')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="mt-4">
                <Link href="/login">{t('nav.login')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : isLoadingViews ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
             <Skeleton className="h-[400px] w-full" />
             <Skeleton className="h-[400px] w-full" />
          </div>
        ) : savedViews && savedViews.length > 0 ? (
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
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{view.name}</CardTitle>
                        <CardDescription>{view.description || savedChartResponse.explanation}</CardDescription>
                      </div>
                      <RefutationDialog contentId={`saved-view-${view.id}`} />
                    </div>
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
        ) : (
           <Card className="flex flex-col items-center justify-center text-center py-12">
            <CardHeader>
                <NotebookText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <CardTitle className="mt-4">{t('dashboard.noSavedTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('dashboard.noSavedDesc')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('dashboard.mainIndicators')}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DataSetChart dataSetKey="gdp" />
          <DataSetChart dataSetKey="unemployment" />
          <DataSetChart dataSetKey="inflation" />
        </div>
      </div>
    </div>
  );
}
