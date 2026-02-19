'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { publicDataToSeed, DataSetKey } from '@/lib/data';
import { statisticalDataToSeed } from '@/lib/statistical-data';
import { systemDataSources } from '@/lib/system-data-sources';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';

const ADMIN_EMAIL = 'antonio.anacleto@gmail.com';

export default function SeedPage() {
  const [isSeedingPublic, setIsSeedingPublic] = useState(false);
  const [isSeedingStats, setIsSeedingStats] = useState(false);
  const [isSeedingSources, setIsSeedingSources] = useState(false);
  const [isSettingAdmin, setIsSettingAdmin] = useState(false);
  
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
      router.replace('/home');
    }
  }, [user, isUserLoading, router, toast]);

  const handleMakeAdmin = async () => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    setIsSettingAdmin(true);
    try {
      const docRef = doc(firestore, 'roles_admin', user.uid);
      await setDoc(docRef, { 
        email: user.email, 
        assignedAt: serverTimestamp(),
        grantedBy: 'system-bootstrap'
      });
      toast({ title: 'Perfil de administrador ativado com sucesso!' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erro ao ativar administrador' });
    } finally {
      setIsSettingAdmin(false);
    }
  };

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
        requestResourceData: { detail: 'Batch write for publicData failed.' },
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
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
        description: 'Os dados foram carregados.',
      });
    } catch (error: any) {
      console.error("Error seeding stats: ", error);
      const permissionError = new FirestorePermissionError({
        path: 'statisticalData',
        operation: 'create',
        requestResourceData: { detail: 'Batch write for statisticalData failed.' },
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
      });
    } finally {
      setIsSeedingStats(false);
    }
  };

  const handleSeedDataSources = async () => {
    setIsSeedingSources(true);
    toast({
      title: 'A semear as fontes de dados...',
      description: 'A carregar as fontes de dados do sistema.',
    });

    try {
      for (const source of systemDataSources) {
        const id = source.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        const docRef = doc(firestore, 'dataSources', id);
        await setDoc(docRef, { ...source, id }, { merge: true });
      }

      toast({
        title: 'Fontes de dados carregadas!',
      });
    } catch (error: any) {
      console.error("Error seeding sources: ", error);
      const permissionError = new FirestorePermissionError({
        path: 'dataSources',
        operation: 'create',
        requestResourceData: { detail: 'Batch write failed.' },
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar fontes de dados',
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
      <h1 className="text-3xl font-bold font-headline tracking-tight">Configuração Inicial (Seed)</h1>
      <p className="text-muted-foreground">
        Use este ecrã para carregar os conjuntos de dados iniciais e configurar o seu acesso administrativo.
      </p>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Configuração de Administrador
          </CardTitle>
          <CardDescription>
            Ative o seu perfil como administrador oficial na base de dados para desbloquear o Painel de Administração e gestão de dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleMakeAdmin} disabled={isSettingAdmin}>
            {isSettingAdmin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ativar Perfil de Administrador
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados de Indicadores (Dashboard)</CardTitle>
          <CardDescription>
            Popula a coleção 'publicData' com os dados de PIB, Desemprego e Inflação de 2026.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeedPublicData} disabled={isSeedingPublic} variant="outline">
            {isSeedingPublic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Carregar Indicadores
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
          <Button onClick={handleSeedStatisticalData} disabled={isSeedingStats} variant="outline">
            {isSeedingStats && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Carregar Dados do Explorador
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fontes de Dados (Admin)</CardTitle>
          <CardDescription>
            Popula a coleção 'dataSources' com as fontes de dados oficiais do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeedDataSources} disabled={isSeedingSources} variant="outline">
            {isSeedingSources && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Carregar Fontes de Dados
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}