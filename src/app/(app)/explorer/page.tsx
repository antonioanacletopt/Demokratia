"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
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

  if (data.length === 0) return <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>;
  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader><TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{data.map((row, i) => (<TableRow key={i}>{headers.map(h => <TableCell key={`${i}-${h}`}>{String(row[h])}</TableCell>)}</TableRow>))}</TableBody>
      </Table>
    </div>
  );
}

export default function ExplorerPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const [statRequest, setStatRequest] = useState('');
  const [aiResponse, setAiResponse] = useState<FindPublicStatisticOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<string | null>(null);

  const performSearch = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    setStatRequest(text);

    try {
      const result = await getPublicStatistic({ request: text });
      setAiResponse(result);
      if (result.isFound && firestore) {
          const id = generateSlug(text);
          setDoc(doc(collection(firestore, 'publicStatisticQueries'), id), {
            request: text, ...result, createdAt: serverTimestamp(),
          }, { merge: true }).catch(() => {});
      }
    } finally {
      setIsAiLoading(false);
    }
  }, [firestore]);

  // GATILHO ATÓMICO: Dispara assim que deteta o URL, sem filtros.
  useEffect(() => {
    const rawParam = searchParams.get('request');
    if (rawParam && rawParam !== processedRef.current) {
      processedRef.current = rawParam;
      const decoded = decodeURIComponent(rawParam.replace(/\+/g, ' '));
      setStatRequest(decoded);
      performSearch(decoded);
    }
  }, [searchParams, performSearch]);

  useEffect(() => { if (aiResponse && resultRef.current) resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [aiResponse]);

  const datasetsRef = useMemoFirebase(() => collection(firestore, 'statisticalData'), [firestore]);
  const { data: datasets, isLoading } = useCollection<StatisticalData>(datasetsRef);

  const groupedDatasets = useMemo(() => {
    if (!datasets) return {};
    const filtered = searchTerm ? datasets.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase())) : datasets;
    return filtered.reduce((acc, d) => {
      const cat = d.category || 'Outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(d);
      return acc;
    }, {} as Record<string, StatisticalData[]>);
  }, [datasets, searchTerm]);

  return (
    <div className="flex flex-col gap-8">
      <div><h1 className="text-3xl font-bold font-headline">{t('explorer.title')}</h1><p className="text-muted-foreground">{t('explorer.description')}</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="text-accent" />{t('explorer.aiCardTitle')}</CardTitle><CardDescription>{t('explorer.aiCardDesc')}</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder={t('explorer.textareaPlaceholder')} value={statRequest} onChange={(e) => setStatRequest(e.target.value)} disabled={isAiLoading} />
          <div ref={resultRef} className="scroll-mt-20">
            {isAiLoading && <div className="space-y-3 pt-4"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-20 w-full" /></div>}
            {aiResponse && !isAiLoading && (
              <Alert variant={aiResponse.isFound ? 'default' : 'destructive'} className="mt-4">
                <Bot className="h-4 w-4" /><div className="flex justify-between items-start w-full"><AlertTitle>{t('common.aiResponse')}</AlertTitle><RefutationDialog contentId={`ai-stat-${generateSlug(statRequest)}`} /></div>
                <AlertDescription className="mt-2"><p className="mb-2">{aiResponse.explanation}</p>{aiResponse.isFound && aiResponse.data && (<div className="mt-4 space-y-2"><DataTable jsonData={aiResponse.data} />{aiResponse.source && <p className="text-xs text-muted-foreground pt-2"><strong>{t('explorer.source')}:</strong> {aiResponse.source}</p>}</div>)}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter><Button onClick={() => performSearch(statRequest)} disabled={isAiLoading || !statRequest.trim()}>{isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}{t('explorer.searchBtn')}</Button></CardFooter>
      </Card>
      <AdBanner />
      <div><h2 className="text-2xl font-bold">{t('explorer.existingDataTitle')}</h2><div className="relative mt-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('explorer.searchPlaceholder')} className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>
      {isLoading ? <Skeleton className="h-12 w-full" /> : (<div className="space-y-6">{Object.entries(groupedDatasets).map(([cat, ds]) => (<div key={cat}><h3 className="text-lg font-semibold mb-2">{cat}</h3><Accordion type="single" collapsible className="w-full border rounded-lg bg-card">{ds.map(d => (
        <AccordionItem key={d.id} value={d.id}>
          <AccordionTrigger className="px-4"><div className="flex gap-2"><span className="font-semibold">{d.title}</span><Badge variant="secondary">{d.category}</Badge></div></AccordionTrigger>
          <AccordionContent className="space-y-4 px-4"><div className="flex justify-end pt-2"><RefutationDialog contentId={`dataset-${d.id}`} /></div><p className="text-sm text-muted-foreground">{d.description}</p><DataTable jsonData={d.data} /><p className="text-xs text-muted-foreground"><strong>{t('explorer.source')}:</strong> {d.source}</p></AccordionContent>
        </AccordionItem>
      ))}</Accordion></div>))}</div>)}
    </div>
  );
}
