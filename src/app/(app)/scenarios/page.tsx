'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ScenariosPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div className="flex h-full items-center justify-center py-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Cenários e Simulações</h1>
        <p className="text-muted-foreground">Esta página será dedicada à análise profunda de cenários macroeconómicos complexos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="text-primary" />
            Em Breve
          </CardTitle>
          <CardDescription>Estamos a preparar ferramentas de simulação avançadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Pode utilizar o nosso simulador de políticas económicas atual para testar o impacto de medidas imediatas.
          </p>
          <Button asChild>
            <Link href="/simulations">Ir para Simulações</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
