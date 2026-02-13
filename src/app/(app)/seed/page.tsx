'use client';

import { useState } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { publicDataToSeed, DataSetKey } from '@/lib/data';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    toast({
      title: 'A semear os dados...',
      description: 'A carregar os dados públicos iniciais para o Firestore.',
    });

    try {
      const dataKeys = Object.keys(publicDataToSeed) as DataSetKey[];

      for (const key of dataKeys) {
        const dataSet = publicDataToSeed[key];
        const docRef = doc(firestore, 'publicData', key);
        
        // Using setDoc which creates or overwrites.
        // We use the non-blocking version to avoid waiting and let the UI remain responsive.
        // Error handling is done globally via the error emitter.
        setDocumentNonBlocking(docRef, dataSet, {});
      }
      
      // Give feedback to the user.
      setTimeout(() => {
        toast({
          title: 'Concluído!',
          description: 'Os dados foram carregados. Pode navegar para o Dashboard para os ver.',
        });
        setIsSeeding(false);
      }, 1500); // A small delay to make it feel like an async operation

    } catch (error) {
      console.error("Error seeding data: ", error);
      toast({
        variant: 'destructive',
        title: 'Oh não! Algo correu mal.',
        description: 'Não foi possível carregar os dados. Verifique a consola para mais detalhes.',
      });
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline tracking-tight">Carregar Dados Iniciais (Seed)</h1>
      <p className="text-muted-foreground">
        Use este ecrã para carregar os conjuntos de dados públicos iniciais para a sua base de dados Firestore.
        Esta é uma operação que só precisa de ser executada uma vez. Depois de executar, pode remover esta página.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Controlo de Dados</CardTitle>
          <CardDescription>
            Clique no botão abaixo para popular a coleção 'publicData' no Firestore com os dados de PIB, Desemprego e Inflação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeedData} disabled={isSeeding}>
            {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSeeding ? 'A carregar...' : 'Carregar Dados para o Firestore'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
