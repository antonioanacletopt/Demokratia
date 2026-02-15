'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { publicDataToSeed, DataSetKey } from '@/lib/data';
import { statisticalDataToSeed } from '@/lib/statistical-data';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ADMIN_EMAIL = 'antonio.anacleto@gmail.com';

export default function SeedPage() {
  const [isSeedingPublic, setIsSeedingPublic] = useState(false);
  const [isSeedingStats, setIsSeedingStats] = useState(false);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && (!user || user.email !== ADMIN_EMAIL)) {
      toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'Não tem permissão para aceder a esta página.',
      });
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router, toast]);

  const handleSeedPublicData = async () => {
    setIsSeedingPublic(true);
    toast({
      title: 'A semear os dados de indicadores...',
      description: 'A carregar os dados públicos (PIB, etc.) para o Firestore.',
    });

    try {
      const dataKeys = Object.keys(publicDataToSeed) as DataSetKey[];

      for (const key of dataKeys) {
        const dataSet = publicDataToSeed[key];
        const docRef = doc(firestore, 'publicData', key);
        setDocumentNonBlocking(docRef, dataSet, {});
      }
      
      setTimeout(() => {
        toast({
          title: 'Indicadores carregados!',
          description: 'Os dados foram carregados. Pode navegar para o Dashboard para os ver.',
        });
        setIsSeedingPublic(false);
      }, 1500); 

    } catch (error) {
      console.error("Error seeding public data: ", error);
      toast({
        variant: 'destructive',
        title: 'Oh não! Algo correu mal.',
        description: 'Não foi possível carregar os dados de indicadores.',
      });
      setIsSeedingPublic(false);
    }
  };

  const handleSeedStatisticalData = async () => {
    setIsSeedingStats(true);
    toast({
      title: 'A semear os dados estatísticos...',
      description: 'A carregar os dados para o Explorador para o Firestore.',
    });

    try {
      for (const dataSet of statisticalDataToSeed) {
        // We need to stringify the 'data' field before sending it to Firestore
        const docData = {
          ...dataSet,
          data: JSON.stringify(dataSet.data),
        };
        const docRef = doc(firestore, 'statisticalData', dataSet.id);
        setDocumentNonBlocking(docRef, docData, {});
      }
      
      setTimeout(() => {
        toast({
          title: 'Dados estatísticos carregados!',
          description: 'Os dados foram carregados. Pode navegar para o Explorador para os ver.',
        });
        setIsSeedingStats(false);
      }, 1500);

    } catch (error) {
      console.error("Error seeding statistical data: ", error);
      toast({
        variant: 'destructive',
        title: 'Oh não! Algo correu mal.',
        description: 'Não foi possível carregar os dados estatísticos.',
      });
      setIsSeedingStats(false);
    }
  };

  if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">A verificar permissões...</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline tracking-tight">Carregar Dados Iniciais (Seed)</h1>
      <p className="text-muted-foreground">
        Use este ecrã para carregar os conjuntos de dados iniciais para a sua base de dados Firestore.
        Esta é uma operação que só precisa de ser executada uma vez.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Dados de Indicadores (Dashboard)</CardTitle>
          <CardDescription>
            Clique no botão abaixo para popular a coleção 'publicData' com os dados de PIB, Desemprego e Inflação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeedPublicData} disabled={isUserLoading || isSeedingPublic}>
            {(isUserLoading || isSeedingPublic) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUserLoading ? 'A autenticar...' : isSeedingPublic ? 'A carregar...' : 'Carregar Dados do Dashboard'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Dados Estatísticos (Explorador)</CardTitle>
          <CardDescription>
            Clique no botão abaixo para popular a coleção 'statisticalData' com dados sobre demografia e economia para a nova página do Explorador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeedStatisticalData} disabled={isUserLoading || isSeedingStats}>
            {(isUserLoading || isSeedingStats) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUserLoading ? 'A autenticar...' : isSeedingStats ? 'A carregar...' : 'Carregar Dados do Explorador'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
