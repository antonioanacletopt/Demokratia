'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { publicDataToSeed, DataSetKey } from '@/lib/data';
import { statisticalDataToSeed } from '@/lib/statistical-data';
import { systemDataSources } from '@/lib/system-data-sources';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'antonio.anacleto@gmail.com';

export default function SeedPage() {
  const [isSeedingPublic, setIsSeedingPublic] = useState(false);
  const [isSeedingStats, setIsSeedingStats] = useState(false);
  const [isSeedingSources, setIsSeedingSources] = useState(false);
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
        await setDoc(docRef, dataSet);
      }
      
      toast({
        title: 'Indicadores carregados!',
        description: 'Os dados foram carregados. Pode navegar para o Dashboard para os ver.',
      });
    } catch (error: any) {
      console.error("Error seeding public data: ", error);
      const permissionError = new FirestorePermissionError({
        path: 'publicData',
        operation: 'create',
        requestResourceData: { detail: 'Batch write for publicData from seed page failed.' },
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados de indicadores',
        description: error.message || 'Verifique as permissões e tente novamente.',
      });
    } finally {
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
        const docData = {
          ...dataSet,
          data: JSON.stringify(dataSet.data),
        };
        const docRef = doc(firestore, 'statisticalData', dataSet.id);
        await setDoc(docRef, docData);
      }
      
      toast({
        title: 'Dados estatísticos carregados!',
        description: 'Os dados foram carregados. Pode navegar para o Explorador para os ver.',
      });
    } catch (error: any) {
      console.error("Error seeding statistical data: ", error);
      const permissionError = new FirestorePermissionError({
        path: 'statisticalData',
        operation: 'create',
        requestResourceData: { detail: 'Batch write for statisticalData from seed page failed.' },
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados estatísticos',
        description: error.message || 'Verifique as permissões e tente novamente.',
      });
    } finally {
      setIsSeedingStats(false);
    }
  };

  const handleSeedDataSources = async () => {
    setIsSeedingSources(true);
    toast({
      title: 'A semear as fontes de dados...',
      description: 'A carregar as fontes de dados do sistema para o Firestore.',
    });

    try {
      for (const source of systemDataSources) {
        const id = source.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        const docRef = doc(firestore, 'dataSources', id);
        await setDoc(docRef, { ...source, id }, { merge: true });
      }

      toast({
        title: 'Fontes de dados carregadas!',
        description: 'As fontes foram carregadas. Pode geri-las na página de Admin.',
      });
    } catch (error: any) {
      console.error("Error seeding data sources: ", error);
      const permissionError = new FirestorePermissionError({
        path: 'dataSources',
        operation: 'create',
        requestResourceData: { detail: 'Batch write for dataSources from seed page failed.' },
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar fontes de dados',
        description: error.message || 'Verifique as permissões e tente novamente.',
      });
    } finally {
      setIsSeedingSources(false);
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
            Popula a coleção 'publicData' com os dados de PIB, Desemprego e Inflação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeedPublicData} disabled={isUserLoading || isSeedingPublic}>
            {(isUserLoading || isSeedingPublic) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSeedingPublic ? 'A carregar...' : 'Carregar Dados do Dashboard'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados Estatísticos (Explorador)</CardTitle>
          <CardDescription>
            Popula a coleção 'statisticalData' com dados para a página do Explorador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeedStatisticalData} disabled={isUserLoading || isSeedingStats}>
            {(isUserLoading || isSeedingStats) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSeedingStats ? 'A carregar...' : 'Carregar Dados do Explorador'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fontes de Dados (Admin)</CardTitle>
          <CardDescription>
            Popula a coleção 'dataSources' com as fontes de dados do sistema para a página de Admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeedDataSources} disabled={isUserLoading || isSeedingSources}>
            {(isUserLoading || isSeedingSources) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSeedingSources ? 'A carregar...' : 'Carregar Fontes de Dados'}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
