'use client';

import { useState } from 'react';
import Link from 'next/link';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, NotebookText, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  createdAt: any; // Firestore Timestamp
}

export default function ScenariosPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const scenariosCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'simulationScenarios');
  }, [firestore, user]);

  const { data: scenarios, isLoading: isLoadingScenarios } = useCollection<SimulationScenario>(scenariosCollection);

  const handleSaveScenario = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Ação Requer Autenticação',
        description: 'Por favor, inicie sessão para guardar um cenário.',
      });
      return;
    }
    
    if (!scenariosCollection) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível aceder à coleção de cenários. Por favor, tente novamente."
        });
        return;
    }

    if (!newScenarioName.trim() || !newScenarioDescription.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campos em falta',
        description: 'Por favor, preencha o nome e a descrição do cenário.',
      });
      return;
    }

    setIsSaving(true);

    const scenarioData = {
      userId: user.uid,
      name: newScenarioName,
      description: newScenarioDescription,
      parameters: '{}', // Placeholder for future structured parameters
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDoc(scenariosCollection, scenarioData)
      .then(() => {
        toast({
          title: 'Cenário guardado!',
          description: 'O seu novo cenário de simulação foi guardado com sucesso.',
        });
        setNewScenarioName('');
        setNewScenarioDescription('');
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: scenariosCollection.path,
          operation: 'create',
          requestResourceData: scenarioData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Meus Cenários de Simulação</h1>
        <p className="text-muted-foreground">Crie e gira os seus próprios cenários para usar no simulador económico.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Criar Novo Cenário
              </CardTitle>
              <CardDescription>Defina uma nova hipótese para simulação. Qualquer pessoa pode criar, mas só utilizadores autenticados podem guardar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scenario-name">Nome do Cenário</Label>
                <Input
                  id="scenario-name"
                  placeholder="Ex: Impacto da seca na agricultura"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-description">Descrição Detalhada</Label>
                <Textarea
                  id="scenario-description"
                  placeholder="Descreva as premissas, variáveis e o que pretende analisar. Ex: Uma seca prolongada de 6 meses no Alentejo que afeta a produção de azeite e vinho..."
                  value={newScenarioDescription}
                  onChange={(e) => setNewScenarioDescription(e.target.value)}
                  rows={6}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <Button onClick={handleSaveScenario} disabled={isSaving || !user}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cenário
              </Button>
               {!user && !isUserLoading && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" /> <span><Link href="/login" className="font-semibold text-primary hover:underline">Inicie sessão</Link> para guardar.</span>
                </p>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NotebookText className="h-5 w-5" />
                Cenários Guardados
              </CardTitle>
               {!user && !isUserLoading && (
                <CardDescription className="!mt-2 flex items-center gap-2 text-amber-600">
                  <User className="h-4 w-4" /> <span><Link href="/login" className="underline font-semibold">Inicie sessão</Link> para ver e gerir os seus cenários guardados.</span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {isUserLoading ? (
                 <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <h3 className="mt-4 text-lg font-medium text-muted-foreground">A carregar...</h3>
                </div>
              ) : user ? (
                isLoadingScenarios ? (
                    <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    </div>
                ) : scenarios && scenarios.length > 0 ? (
                  <div className="space-y-4">
                    {scenarios.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds).map((scenario) => (
                      <div key={scenario.id} className="rounded-lg border p-4 space-y-2">
                        <h3 className="font-semibold">{scenario.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{scenario.description}</p>
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-xs text-muted-foreground">
                            Criado em: {new Date(scenario.createdAt?.seconds * 1000).toLocaleDateString()}
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/simulator?policy=${encodeURIComponent(scenario.description)}`}>
                              Carregar no Simulador
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                    <NotebookText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                      Ainda não guardou nenhum cenário.
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use o formulário ao lado para criar o seu primeiro.
                    </p>
                  </div>
                )
              ) : (
                 <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 text-center">
                  <NotebookText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                    Inicie sessão para ver os seus cenários
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Os seus cenários guardados aparecem aqui para poder reutilizá-los.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
