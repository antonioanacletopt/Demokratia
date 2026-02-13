"use client";

import { useState, useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface StatisticalData {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  dataType: string;
  data: string; // JSON string
}

function DataTable({ jsonData }: { jsonData: string }) {
  const data = useMemo(() => {
    try {
      const parsedData = JSON.parse(jsonData);
      // Ensure data is an array before processing
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map(header => <TableCell key={`${rowIndex}-${header}`}>{row[header]}</TableCell>)}
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
      <AccordionTrigger>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left">
          <span className="font-semibold">{dataset.title}</span>
          <Badge variant="secondary">{dataset.category}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
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

  const filteredDatasets = useMemo(() => {
    if (!datasets) return [];
    return datasets.filter(dataset =>
      dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [datasets, searchTerm]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Explorador de Dados Sociais e Económicos</h1>
        <p className="text-muted-foreground">Explore conjuntos de dados sobre demografia, economia e sociedade em Portugal.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisar por título, descrição ou categoria..."
          className="w-full pl-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <StatAccordionSkeleton />
      ) : filteredDatasets && filteredDatasets.length > 0 ? (
        <Accordion type="single" collapsible className="w-full border rounded-lg px-4">
          {filteredDatasets.map(dataset => (
            <StatAccordionItem key={dataset.id} dataset={dataset} />
          ))}
        </Accordion>
      ) : (
        <div className="lg:col-span-2">
          <Card className="flex flex-col items-center justify-center text-center py-12">
            <CardHeader>
              <CardTitle>Nenhuns dados encontrados</CardTitle>
            </CardHeader>
            <CardContent>
              {searchTerm ? (
                <p>A sua pesquisa não encontrou nenhum resultado. Tente outros termos.</p>
              ) : (
                <p>Não foi possível carregar os dados estatísticos. Tente carregar os dados na página 'Seed Data'.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
