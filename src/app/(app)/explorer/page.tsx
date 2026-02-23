"use client";

import { useState, useMemo, useTransition, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, doc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getPublicStatistic } from '@/lib/actions';
import type { FindPublicStatisticOutput } from '@/ai/flows/find-public-statistic';
import { useTranslation } from '@/lib/i18n';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search, Bot, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AdBanner } from '@/components/AdBanner';
import { RefutationDialog } from '@/components/RefutationDialog';

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
  const { t } = useTranslation();
  return (
    <AccordionItem value={dataset.id}>
      <AccordionTrigger className="px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left">
          <span className="font-semibold">{dataset.title}</span>
          <Badge variant="secondary">{dataset.category}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-4 relative">
        <div className="flex justify-end gap-2 pt-2">
            <RefutationDialog contentId={`dataset-${dataset.id}`} />
        </div>
        <p className="text-sm text-muted-foreground">{dataset.description}</p>
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
  const processedRequestRef = useRef<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  const [statRequest, setStatRequest] = useState('');
  const [aiResponse, setAiResponse] = useState<FindPublicStatisticOutput | null>(null);
  const [isAiLoading, startAiTransition] = useTransition();

  const handleStatRequest = useCallback(async (customRequest?: string) => {
    const requestToUse = (customRequest || statRequest).trim();
    if (!requestToUse) return;
    
    setAiResponse(null);
    startAiTransition(async () => {
      // Disparamos a IA IMEDIATAMENTE sem esperar pelo Firestore
      const result = await getPublicStatistic({ request: requestToUse });
      setAiResponse(result);

      // Tentamos gravar na base de dados APÓS termos o resultado e SE o firestore estiver pronto
      if (result.isFound && firestore) {
          const id = generateSlug(requestToUse);
          setDoc(doc(collection(firestore, 'publicStatisticQueries'), id), {
            request: requestToUse,
            ...result,
            createdAt: serverTimestamp(),
          }, { merge: true }).catch(() => {});
      }
    });
  }, [statRequest, firestore]);

  // Gatilho Atómico de URL
  useEffect(() => {
    const queryParam = searchParams.get('request');
    if (queryParam && queryParam !== processedRequestRef.current) {
      processedRequestRef.current = queryParam;
      const decoded = decodeURIComponent(queryParam.replace(/\+/g, ' '));
      setStatRequest(decoded);
      // Disparamos diretamente ignorando delays de estado
      handleStatRequest(decoded);
    }
  }, [searchParams, handleStatRequest]);

  useEffect(() => {
    if (aiResponse && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [aiResponse]);

  const statisticalDataCollection = useMemoFirebase(() => collection(firestore, 'statisticalData'), [firestore]);
  const { data: datasets, isLoading } = useCollection<StatisticalData>(statisticalDataCollection);

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
            {isAiLoading && (
              <div className="space-y-3 pt-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
            {aiResponse && !isAiLoading && (
              <Alert variant={aiResponse.isFound ? 'default' : 'destructive'} className="mt-4">
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
            {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
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

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
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
