"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from 'react';
import { collection, serverTimestamp, addDoc, query, where, limit, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getPublicStatistic, getTranslation } from '@/lib/actions';
import type { FindPublicStatisticOutput } from '@/ai/flows/find-public-statistic';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search, Bot, Loader2, Frown, FileText, Sparkles, Languages, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AdBanner } from '@/components/AdBanner';

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
  const [isTranslating, startTransition] = useTransition();
  const [translated, setTranslated] = useState<{ title: string, desc: string, cat: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  // Auto-check cache
  useEffect(() => {
    if (language === 'en') {
      const checkCache = async () => {
        const [tTitle, tDesc, tCat] = await Promise.all([
          getTranslation(dataset.title, 'en', false),
          getTranslation(dataset.description, 'en', false),
          getTranslation(dataset.category, 'en', false)
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
  }, [language, dataset]);

  const handleTranslate = () => {
    startTransition(async () => {
      const [tTitle, tDesc, tCat] = await Promise.all([
        getTranslation(dataset.title, language),
        getTranslation(dataset.description, language),
        getTranslation(dataset.category, language)
      ]);
      setTranslated({ title: tTitle || dataset.title, desc: tDesc || dataset.description, cat: tCat || dataset.category });
      setShowOriginal(false);
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
        {language !== 'pt' && (
          <div className="flex justify-end absolute right-4 top-0">
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
          </div>
        )}
        <p className="text-sm text-muted-foreground pt-2">{currentDesc}</p>
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
  const statisticalDataCollection = useMemoFirebase(() => collection(firestore, 'statisticalData'), [firestore]);
  const { data: datasets, isLoading } = useCollection<StatisticalData>(statisticalDataCollection);

  const [statRequest, setStatRequest] = useState('');
  const [aiResponse, setAiResponse] = useState<FindPublicStatisticOutput | null>(null);
  const [isAiLoading, startAiTransition] = useTransition();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((aiResponse || isAiLoading) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [aiResponse, isAiLoading]);

  const handleStatRequest = () => {
    if (!statRequest.trim() || !firestore) return;
    const trimmedRequest = statRequest.trim();

    startAiTransition(async () => {
      setAiResponse(null);
      const result = await getPublicStatistic({ request: trimmedRequest });
      setAiResponse(result);

      if (result.isFound) {
          const publicCollection = collection(firestore, 'publicStatisticQueries');
          addDoc(publicCollection, {
            request: trimmedRequest,
            ...result,
            createdAt: serverTimestamp(),
            lastAccessedAt: serverTimestamp(),
          }).catch(err => console.warn("Failed cache", err));
      }
    });
  };

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
          <div ref={resultRef}>
            {isAiLoading && <Skeleton className="h-20 w-full" />}
            {aiResponse && !isAiLoading && (
              <Alert variant={aiResponse.isFound ? 'default' : 'destructive'}>
                <Bot className="h-4 w-4" />
                <AlertTitle>{t('common.aiResponse')}</AlertTitle>
                <AlertDescription>
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
          <Button onClick={handleStatRequest} disabled={isAiLoading || !statRequest.trim()}>
            {isAiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                <button key={q.id} className="w-full text-left rounded-lg border p-4 hover:bg-muted/50" onClick={() => setStatRequest(q.request)}>
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
              <Accordion type="single" collapsible className="w-full border rounded-lg">
                {ds.map(d => <StatAccordionItem key={d.id} dataset={d} />)}
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
