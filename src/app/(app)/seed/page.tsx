'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { publicDataToSeed, DataSetKey } from '@/lib/data';
import { statisticalDataToSeed } from '@/lib/statistical-data';
import { getSystemDataSources } from '@/lib/system-data-sources';
import { useTranslation } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Database, Server, Sparkles } from 'lucide-react';

const ADMIN_EMAIL = 'antonio.anacleto@gmail.com';

export default function SeedPage() {
  const { t } = useTranslation();
  const [isSeedingPublic, setIsSeedingPublic] = useState(false);
  const [isSeedingStats, setIsSeedingStats] = useState(false);
  const [isSeedingSources, setIsSeedingSources] = useState(false);
  const [isSettingAdmin, setIsSettingAdmin] = useState(false);
  
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const systemDataSources = getSystemDataSources(t);

  useEffect(() => {
    if (!isUserLoading && (!user || (user.email !== ADMIN_EMAIL && user.uid !== 'id5hDeMIVZeR9i9HG5vvqnjEto32'))) {
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
        displayName: user.displayName,
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
    toast({ title: 'A carregar indicadores...' });
    try {
      const dataToSeed = publicDataToSeed(t);
      const dataKeys = Object.keys(dataToSeed) as DataSetKey[];
      for (const key of dataKeys) {
        const dataSet = dataToSeed[key];
        const docRef = doc(firestore, 'publicData', key);
        await setDoc(docRef, dataSet);
      }
      toast({ title: 'Indicadores carregados!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar indicadores' });
    } finally { setIsSeedingPublic(false); }
  };

  const handleSeedStatisticalData = async () => {
    setIsSeedingStats(true);
    toast({ title: 'A carregar estatísticas...' });
    try {
      const dataToSeed = statisticalDataToSeed(t);
      for (const dataSet of dataToSeed) {
        const docData = { ...dataSet, data: JSON.stringify(dataSet.data) };
        const docRef = doc(firestore, 'statisticalData', dataSet.id);
        await setDoc(docRef, docData);
      }
      toast({ title: 'Dados estatísticos carregados!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar estatísticas' });
    } finally { setIsSeedingStats(false); }
  };

  const handleSeedDataSources = async () => {
    setIsSeedingSources(true);
    toast({ title: 'A carregar fontes...' });
    try {
      for (const source of systemDataSources) {
        const docRef = doc(firestore, 'dataSources', source.id);
        await setDoc(docRef, source, { merge: true });
      }
      toast({ title: 'Fontes carregadas!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar fontes' });
    } finally { setIsSeedingSources(false); }
  };

  if (isUserLoading || !user || (user.email !== ADMIN_EMAIL && user.uid !== 'id5hDeMIVZeR9i9HG5vvqnjEto32')) {
    return (
      <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10">
      <div>
        <h1 className="text-4xl font-bold font-headline tracking-tight">Painel de Configuração (Seed)</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Configure o acesso administrativo e carregue os dados de 2026 para o sistema.
        </p>
      </div>

      <Card className="border-primary bg-primary/5 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <ShieldCheck className="h-8 w-8 text-primary" />
            1. Ativação Administrativa
          </CardTitle>
          <CardDescription className="text-base">
            Clique neste botão para registar permanentemente o seu acesso como administrador nas regras de segurança do Firestore.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" onClick={handleMakeAdmin} disabled={isSettingAdmin} className="w-full sm:w-auto px-10">
            {isSettingAdmin && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Ativar Perfil de Administrador Oficial
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Indicadores</CardTitle>
            <CardDescription>PIB, Inflação e Desemprego 2026.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeedPublicData} disabled={isSeedingPublic} variant="outline" className="w-full">
              {isSeedingPublic ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Carregar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />Explorador</CardTitle>
            <CardDescription>Dados estatísticos detalhados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeedStatisticalData} disabled={isSeedingStats} variant="outline" className="w-full">
              {isSeedingStats ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Carregar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" />Fontes</CardTitle>
            <CardDescription>Entidades oficiais do sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSeedDataSources} disabled={isSeedingSources} variant="outline" className="w-full">
              {isSeedingSources ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Carregar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
