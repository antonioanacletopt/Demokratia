"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from 'react';
import { collection, serverTimestamp, addDoc, query, where, limit, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getPublicStatistic } from '@/lib/actions';
import type { FindPublicStatisticOutput } from '@/ai/flows/find-public-statistic';
import { useToast } from '@/hooks/use-toast';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search, Bot, Loader2, Frown, FileText, Sparkles } from 'lucide-react';
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
  data: string; // JSON string
}

interface PublicStatisticQuery extends FindPublicStatisticOutput {
  id: string;
  request: string;
  createdAt: any;
}

function DataTable({ jsonData }: { jsonData: string }) {
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
    return <p className="text-sm text-muted-foreground">Não há dados tabulares para apresentar ou o formato é inválido.</p>;
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
  return (
    <AccordionItem value={dataset.id}>
      <AccordionTrigger className="px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left">
          <span className="font-semibold">{dataset.title}</span>
          <Badge variant="secondary">{dataset.category}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-4">
        <p className="text-sm text-muted-foreground">{dataset.description}</p>
        
        {dataset.dataType === 'table' ? (
          <DataTable jsonData={dataset.data} />
        ) : (
          <p>Tipo de dados '{dataset.dataType}' não suportado.</p>
        )}
        
        <div className="text-xs text-muted-foreground pt-2">
          <p><strong>Fonte:</strong> {dataset.source}</p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function StatAccordionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

export default function ExplorerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const firestore = useFirestore();
  const statisticalDataCollection = useMemoFirebase(() => collection(firestore, 'statisticalData'), [firestore]);
  const { data: datasets, isLoading } = useCollection<StatisticalData>(statisticalDataCollection);

  const [statRequest, setStatRequest] = useState('');
  const [aiResponse, setAiResponse] = useState<FindPublicStatisticOutput | null>(null);
  const [isAiLoading, startAiTransition] = useTransition();
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const publicQueriesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publicStatisticQueries'), orderBy('createdAt', 'desc'), limit(5));
  }, [firestore]);
  const { data: recentQueries, isLoading: isLoadingRecent } = useCollection<PublicStatisticQuery>(publicQueriesCollection);

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
      
      // 1. Check public cache first
      try {
        const q = query(collection(firestore, "publicStatisticQueries"), where("request", "==", trimmedRequest), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const cachedDoc = querySnapshot.docs[0];
          const cachedResult = cachedDoc.data() as FindPublicStatisticOutput;
          setAiResponse(cachedResult);
          toast({ title: "Estatística encontrada na cache!", description: "Esta pergunta já foi respondida anteriormente." });
          
          const docRef = doc(firestore, "publicStatisticQueries", cachedDoc.id);
          updateDoc(docRef, { lastAccessedAt: serverTimestamp() }).catch(e => console.warn("Failed to update cache timestamp", e));
          
          return;
        }
      } catch (e) {
        console.error("Error checking public cache:", e);
        toast({ variant: "destructive", title: "Aviso", description: "Não foi possível verificar a cache. A contactar a IA diretamente."});
      }

      // 2. If not in cache, call AI
      const result = await getPublicStatistic({ request: trimmedRequest });
      setAiResponse(result);

      // 3. If AI found data, save to public cache (non-blocking)
      if (result.isFound) {
          const publicCollection = collection(firestore, 'publicStatisticQueries');
          const cacheData = {
            request: trimmedRequest,
            ...result,
            createdAt: serverTimestamp(),
            lastAccessedAt: serverTimestamp(),
          };
          addDoc(publicCollection, cacheData).catch(err => {
              console.warn("Failed to write to public cache", err);
          });
      }
    });
  };

  const groupedAndFilteredDatasets = useMemo(() => {
    if (!datasets) return {};

    const filtered = searchTerm
      ? datasets.filter(dataset =>
          dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dataset.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : datasets;

    return filtered.reduce((acc, dataset) => {
      const category = dataset.category || 'Outros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(dataset);
      return acc;
    }, {} as Record<string, StatisticalData[]>);
  }, [datasets, searchTerm]);

  const totalDatasets = datasets?.length || 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Explorador de Dados Sociais e Económicos</h1>
        <p className="text-muted-foreground">Explore conjuntos de dados sobre demografia, economia e sociedade em Portugal.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-accent" />
            <span>Pergunte à IA por uma Estatística</span>
          </CardTitle>
          <CardDescription>Não encontra o que procura? Descreva a estatística que deseja e a IA tentará encontrá-la em fontes públicas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: Qual a evolução da dívida pública em percentagem do PIB nos últimos 5 anos?"
            value={statRequest}
            onChange={(e) => setStatRequest(e.target.value)}
            disabled={isAiLoading}
          />
          <div ref={resultRef}>
            {isAiLoading && (
              <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {aiResponse && !isAiLoading && (
              <Alert variant={aiResponse.isFound ? 'default' : 'destructive'}>
                <Bot className="h-4 w-4" />
                <AlertTitle>Resposta da IA</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">{aiResponse.explanation}</p>
                  {aiResponse.isFound && aiResponse.data && (
                    <div className="mt-4 space-y-2">
                      <DataTable jsonData={aiResponse.data} />
                      {aiResponse.source && <p className="text-xs text-muted-foreground pt-2"><strong>Fonte:</strong> {aiResponse.source}</p>}
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
            Procurar Estatística
          </Button>
        </CardFooter>
      </Card>
      
      <AdBanner />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Estatísticas Recentes da Comunidade
          </CardTitle>
          <CardDescription>Veja o que outros utilizadores andaram a procurar.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRecent ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : recentQueries && recentQueries.length > 0 ? (
            <div className="space-y-4">
              {recentQueries.map(query => (
                <button 
                  key={query.id} 
                  className="w-full text-left rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  onClick={() => setStatRequest(query.request)}
                >
                  <p className="font-semibold text-muted-foreground italic">"{query.request}"</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                Nenhuma pesquisa pública encontrada
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Seja o primeiro a procurar uma estatística!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold font-headline tracking-tight">Explorar Dados Existentes</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar por título, descrição ou categoria..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <StatAccordionSkeleton />
      ) : totalDatasets > 0 ? (
        Object.keys(groupedAndFilteredDatasets).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedAndFilteredDatasets)
              .sort(([catA], [catB]) => catA.localeCompare(catB))
              .map(([category, categoryDatasets]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-2 tracking-tight">{category}</h3>
                <Accordion type="single" collapsible className="w-full border rounded-lg">
                  {categoryDatasets.map(dataset => (
                    <StatAccordionItem key={dataset.id} dataset={dataset} />
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center py-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Frown className="h-6 w-6"/> Nenhum resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <p>A sua pesquisa não encontrou nenhum conjunto de dados existente.</p>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="flex flex-col items-center justify-center text-center py-12">
          <CardHeader>
            <CardTitle>Nenhuns dados encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Não foi possível carregar os dados estatísticos. Tente carregar os dados na página 'Seed Data'.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    