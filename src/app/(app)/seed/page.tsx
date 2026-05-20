'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, dbSet, nowTs } from '@/firebase';
import { publicDataToSeed, DataSetKey } from '@/lib/data';
import { statisticalDataToSeed } from '@/lib/statistical-data';
import { getSystemDataSources } from '@/lib/system-data-sources';
import { useTranslation } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Database, Server, Sparkles } from 'lucide-react';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? '';

export default function SeedPage() {
  const { t } = useTranslation();
  const [isSeedingPublic, setIsSeedingPublic] = useState(false);
  const [isSeedingStats, setIsSeedingStats] = useState(false);
  const [isSeedingSources, setIsSeedingSources] = useState(false);
  const [isSettingAdmin, setIsSettingAdmin] = useState(false);

  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const systemDataSources = getSystemDataSources(t);

  useEffect(() => {
    if (!isUserLoading && (!user || (user.email !== ADMIN_EMAIL && user.uid !== ADMIN_UID))) {
      toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'NÃ£o tem permissÃ£o para aceder a esta pÃ¡gina.',
      });
      router.replace('/home');
    }
  }, [user, isUserLoading, router, toast]);

  const handleMakeAdmin = async () => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    setIsSettingAdmin(true);
    try {
      await dbSet('roles_admin', user.uid, {
        email: user.email,
        displayName: user.displayName,
        assignedAt: nowTs(),
        grantedBy: 'system-bootstrap',
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
        await dbSet('publicData', key, dataToSeed[key] as unknown as Record<string, unknown>);
      }
      toast({ title: 'Indicadores carregados!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao carregar indicadores' });
    } finally { setIsSeedingPublic(false); }
  };

  const handleSeedStatisticalData = async () => {
    setIsSeedingStats(true);
    toast({ title: 'A carregar estatÃ­sticas...' });
    try {
      for (const dataSet of statisticalDataToSeed(t)) {
        await dbSet('statisticalData', dataSet.id, { ...dataSet, data: JSON.stringify(dataSet.data) } as unknown as Record<string, unknown>);
      }
      toast({ title: 'Dados estatÃ­sticos carregados!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao carregar estatÃ­sticas' });
    } finally { setIsSeedingStats(false); }
  };

  const handleSeedDataSources = async () => {
    setIsSeedingSources(true);
    toast({ title: 'A carregar fontes...' });
    try {
      for (const source of systemDataSources) {
        await dbSet('dataSources', source.id, source as unknown as Record<string, unknown>);
      }
      toast({ title: 'Fontes carregadas!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao carregar fontes' });
    } finally { setIsSeedingSources(false); }
  };

  if (isUserLoading || !user || (user.email !== ADMIN_EMAIL && user.uid !== ADMIN_UID)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10">
      <div>
        <h1 className="text-4xl font-bold font-headline tracking-tight">Painel de ConfiguraÃ§Ã£o (Seed)</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Configure o acesso administrativo e carregue os dados de 2026 para o sistema.
        </p>
      </div>

      <Card className="border-primary bg-primary/5 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <ShieldCheck className="h-8 w-8 text-primary" />
            1. AtivaÃ§Ã£o Administrativa
          </CardTitle>
          <CardDescription className="text-base">
            Clique neste botÃ£o para registar permanentemente o seu acesso como administrador no sistema.
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
            <CardDescription>PIB, InflaÃ§Ã£o e Desemprego 2026.</CardDescription>
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
            <CardDescription>Dados estatÃ­sticos detalhados.</CardDescription>
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
