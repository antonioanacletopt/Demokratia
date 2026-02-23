"use client";

import { useState, useMemo, useTransition, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, doc, setDoc, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getPublicStatistic, getTranslation } from '@/lib/actions';
import type { FindPublicStatisticOutput } from '@/ai/flows/find-public-statistic';
import { useTranslation } from '@/lib/i18n';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search, Bot, Loader2, Sparkles, Languages, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AdBanner } from '@/components/AdBanner';
import { RefutationDialog } from '@/components/RefutationDialog';

const MAX_CACHE_LENGTH = 1000;

interface StatisticalData {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  dataType: string;
  data: string;
}

interface PublicStatisticQuery extends FindPublicStatisticOutput {
  id: string;
  request: string;
  createdAt: any;
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

function DataTable({ jsonData }: { jsonData: string }) {
  const { t } = useTranslation();
  const data = useMemo(() => {
    try {
      const parsedData = JSON.parse(jsonData);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (e) {
      console.error("Failed to parse JSON data:", e);
      return [];
    }
  }, [jsonData]);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map(header => <TableCell key={`${rowIndex}-${header}`}>{String(row[header])}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatAccordionItem({ dataset }: { dataset: StatisticalData }) {
  const { t, language } = useTranslation();
  const firestore = useFirestore();
  const [isTranslating, startTransition] = useTransition();
  const [translated, setTranslated] = useState<{ title: string, desc: string, cat: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  useEffect(() => {
    if (language === 'en' && dataset) {
      const checkCache = async () => {
        const cacheRef = collection(firestore, 'translations_cache');
        const targetLang = 'English';
        
        const fetchCached = async (text: string) => {
          if (!text || text.length > MAX_CACHE_LENGTH) return null;
          const q = query(cacheRef, where('originalText', '==', text), where('targetLanguage', '==', targetLang), limit(1));
          const snap = await getDocs(q);
          return !snap.empty ? snap.docs[0].data().translatedText : null;
        };

        const [tTitle, tDesc, tCat] = await Promise.all([
          fetchCached(dataset.title),
          fetchCached(dataset.description),
          fetchCached(dataset.category)
        ]);

        if (tTitle && tDesc && tCat) {
          setTranslated({ title: tTitle, desc: tDesc, cat: tCat });
          setShowOriginal(false);
        }
      };
      checkCache();
    } else {
      setTranslated(null);
      setShowOriginal(true);
    }
  }, [language, dataset, firestore]);

  const handleTranslate = () => {
    startTransition(async () => {
      const resTitle = await getTranslation(dataset.title, language);
      const resDesc = await getTranslation(dataset.description, language);
      const resCat = await getTranslation(dataset.category, language);
      
      setTranslated({ title: resTitle, desc: resDesc, cat: resCat });
      setShowOriginal(false);

      const cacheRef = collection(firestore, 'translations_cache');
      const targetLang = language === 'en' ? 'English' : 'Portuguese';
      
      const saveToCache = (orig: string, trans: string) => {
        if (orig.length > MAX_CACHE_LENGTH) return;
        setDoc(doc(cacheRef), {
          originalText: orig,
          translatedText: trans,
          targetLanguage: targetLang,
          createdAt: serverTimestamp()
        });
      };

      saveToCache(dataset.title, resTitle);
      saveToCache(dataset.description, resDesc);
      saveToCache(dataset.category, resCat);
    });
  };

  const currentTitle = !showOriginal && translated ? translated.title : dataset.title;
  const currentDesc = !showOriginal && translated ? translated.desc : dataset.description;
  const currentCat = !showOriginal && translated ? translated.cat : dataset.category;

  return (
    <AccordionItem value={dataset.id}>
      <AccordionTrigger className="px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left">
          <span className="font-semibold">{currentTitle}</span>
          <Badge variant="secondary">{currentCat}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-4 relative">
        <div className="flex justify-end gap-2 pt-2">
            <RefutationDialog contentId={`dataset-${dataset.id}`} />
            {language !== 'pt' && (
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
                  disabled={isTranslating} 
                  className="h-8 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary"
              >
                  {isTranslating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : translated ? <RefreshCw className="mr-1 h-3 w-3" /> : <Languages className="mr-1 h-3 w-3" />}
                  {isTranslating ? t('common.translating') : (translated ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate'))}
              </Button>
            )}
        </div>
        <p className="text-sm text-muted-foreground">{currentDesc}</p>
        <DataTable jsonData={dataset.data} />
        <div className="text-xs text-muted-foreground pt-2">
          <p><strong>{t('explorer.source')}:</strong> {dataset.source}</p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function ExplorerPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  
  const statisticalDataCollection = useMemoFirebase(() => collection(firestore, 'statisticalData'), [firestore]);
  const { data: datasets, isLoading } = useCollection<StatisticalData>(statisticalDataCollection);

  const [statRequest, setStatRequest] = useState('');
  const [aiResponse, setAiResponse] = useState<FindPublicStatisticOutput | null>(null);
  const [isAiLoading, startAiTransition] = useTransition();
  const resultRef = useRef<HTMLDivElement>(null);

  const handleStatRequest = useCallback((customRequest?: string) => {
    const requestToUse = (customRequest || statRequest).trim();
    if (!requestToUse || !firestore) return;
    
    const id = generateSlug(requestToUse);

    startAiTransition(async () => {
      setAiResponse(null);
      const result = await getPublicStatistic({ request: requestToUse });
      setAiResponse(result);

      if (result.isFound) {
          const publicCollection = collection(firestore, 'publicStatisticQueries');
          setDoc(doc(publicCollection, id), {
            request: requestToUse,
            ...result,
            createdAt: serverTimestamp(),
          }, { merge: true }).catch(err => console.warn("Failed cache", err));
      }
    });
  }, [statRequest, firestore]);

  useEffect(() => {
    const queryFromUrl = searchParams.get('request');
    if (queryFromUrl) {
      const decoded = decodeURIComponent(queryFromUrl);
      setStatRequest(decoded);
      handleStatRequest(decoded);
    }
  }, [searchParams, handleStatRequest]);

  useEffect(() => {
    if (aiResponse && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [aiResponse]);

  const publicQueriesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publicStatisticQueries'), orderBy('createdAt', 'desc'), limit(5));
  }, [firestore]);
  const { data: recentQueries } = useCollection<PublicStatisticQuery>(publicQueriesCollection);

  const groupedAndFilteredDatasets = useMemo(() => {
    if (!datasets) return {};
    const filtered = searchTerm
      ? datasets.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()) || d.category.toLowerCase().includes(searchTerm.toLowerCase()))
      : datasets;

    return filtered.reduce((acc, d) => {
      const cat = d.category || 'Outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(d);
      return acc;
    }, {} as Record<string, StatisticalData[]>);
  }, [datasets, searchTerm]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">{t('explorer.title')}</h1>
        <p className="text-muted-foreground">{t('explorer.description')}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-accent" />
            <span>{t('explorer.aiCardTitle')}</span>
          </CardTitle>
          <CardDescription>{t('explorer.aiCardDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t('explorer.textareaPlaceholder')}
            value={statRequest}
            onChange={(e) => setStatRequest(e.target.value)}
            disabled={isAiLoading}
          />
          <div ref={resultRef} className="scroll-mt-20">
            {isAiLoading && <Skeleton className="h-20 w-full" />}
            {aiResponse && !isAiLoading && (
              <Alert variant={aiResponse.isFound ? 'default' : 'destructive'}>
                <Bot className="h-4 w-4" />
                <div className="flex justify-between items-start w-full">
                  <AlertTitle>{t('common.aiResponse')}</AlertTitle>
                  <RefutationDialog contentId={`ai-stat-${generateSlug(statRequest)}`} />
                </div>
                <AlertDescription className="mt-2">
                  <p className="mb-2">{aiResponse.explanation}</p>
                  {aiResponse.isFound && aiResponse.data && (
                    <div className="mt-4 space-y-2">
                      <DataTable jsonData={aiResponse.data} />
                      {aiResponse.source && <p className="text-xs text-muted-foreground pt-2"><strong>{t('explorer.source')}:</strong> {aiResponse.source}</p>}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => handleStatRequest()} disabled={isAiLoading || !statRequest.trim()}>
            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {t('explorer.searchBtn')}
          </Button>
        </CardFooter>
      </Card>
      
      <AdBanner />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            {t('explorer.recentQueries')}
          </CardTitle>
          <CardDescription>{t('explorer.recentQueriesDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {recentQueries && recentQueries.length > 0 ? (
            <div className="space-y-4">
              {recentQueries.map(q => (
                <button key={q.id} className="w-full text-left rounded-lg border p-4 hover:bg-muted/50 transition-colors" onClick={() => { setStatRequest(q.request); setAiResponse(q); }}>
                  <p className="font-semibold text-muted-foreground italic">"{q.request}"</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('explorer.noRecentTitle')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold font-headline tracking-tight">{t('explorer.existingDataTitle')}</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder={t('explorer.searchPlaceholder')} className="w-full pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {isLoading ? <Skeleton className="h-40 w-full" /> : (
        <div className="space-y-6">
          {Object.entries(groupedAndFilteredDatasets).map(([cat, ds]) => (
            <div key={cat}>
              <h3 className="text-lg font-semibold mb-2">{cat}</h3>
              <Accordion type="single" collapsible className="w-full border rounded-lg bg-card">
                {ds.map(d => <StatAccordionItem key={d.id} dataset={d} />)}
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
