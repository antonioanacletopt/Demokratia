"use client";

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
      return JSON.parse(jsonData);
    } catch (e) {
      console.error("Failed to parse JSON data:", e);
      return [];
    }
  }, [jsonData]);

  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-sm text-muted-foreground">Não há dados para apresentar.</p>;
  }

  const headers = Object.keys(data[0]);

  return (
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
  );
}

function StatCard({ dataset }: { dataset: StatisticalData }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{dataset.title}</CardTitle>
          <Badge variant="secondary">{dataset.category}</Badge>
        </div>
        <CardDescription>{dataset.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {dataset.dataType === 'table' ? (
          <DataTable jsonData={dataset.data} />
        ) : (
          <p>Tipo de dados '{dataset.dataType}' não suportado.</p>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Fonte: {dataset.source}</p>
      </CardFooter>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-5/6 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full" />
      </CardContent>
       <CardFooter>
        <Skeleton className="h-4 w-1/3" />
      </CardFooter>
    </Card>
  )
}

export default function ExplorerPage() {
  const firestore = useFirestore();
  const statisticalDataCollection = useMemoFirebase(() => collection(firestore, 'statisticalData'), [firestore]);
  const { data: datasets, isLoading } = useCollection<StatisticalData>(statisticalDataCollection);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Explorador de Dados Sociais e Económicos</h1>
        <p className="text-muted-foreground">Explore conjuntos de dados sobre demografia, economia e sociedade em Portugal.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {isLoading && (
            <>
                <StatCardSkeleton />
                <StatCardSkeleton />
            </>
        )}
        {datasets && datasets.length > 0 ? (
          datasets.map(dataset => <StatCard key={dataset.id} dataset={dataset} />)
        ) : (
          !isLoading && (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Nenhuns dados encontrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Não foi possível carregar os dados estatísticos. Tente carregar os dados na página 'Seed Data'.</p>
                </CardContent>
              </Card>
            </div>
          )
        )}
      </div>
    </div>
  );
}

    