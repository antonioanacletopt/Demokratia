'use client';

import { useState } from 'react';
import Link from 'next/link';
import { collection, serverTimestamp, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, NotebookText, User, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  createdAt: any; // Firestore Timestamp
}

const scenarioSchema = z.object({
  name: z.string().min(5, 'O nome deve ter pelo menos 5 caracteres.'),
  description: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres.'),
});

type ScenarioFormValues = z.infer<typeof scenarioSchema>;


export default function ScenariosPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingScenario, setEditingScenario] = useState<SimulationScenario | null>(null);
  
  const scenariosCollection = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'simulationScenarios');
  }, [firestore, user]);

  const { data: scenarios, isLoading: isLoadingScenarios } = useCollection<SimulationScenario>(scenariosCollection);

  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: { name: '', description: '' },
  });

  const handleOpenEditDialog = (scenario: SimulationScenario) => {
    setEditingScenario(scenario);
    form.reset({ name: scenario.name, description: scenario.description });
  };

  const handleCloseEditDialog = () => {
    setEditingScenario(null);
    form.reset({ name: '', description: '' });
  };

  const handleNewScenarioSubmit = async (values: ScenarioFormValues) => {
    if (!user || !scenariosCollection) return;

    setIsSubmitting(true);
    const scenarioData = {
      userId: user.uid,
      name: values.name,
      description: values.description,
      parameters: '{}',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await addDoc(scenariosCollection, scenarioData);
      toast({ title: 'Cenário guardado!' });
      form.reset();
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: scenariosCollection.path,
        operation: 'create',
        requestResourceData: scenarioData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditScenarioSubmit = async (values: ScenarioFormValues) => {
      if (!user || !firestore || !editingScenario) return;
      setIsEditing(true);
      const scenarioRef = doc(firestore, 'users', user.uid, 'simulationScenarios', editingScenario.id);

      try {
        await updateDoc(scenarioRef, {
            name: values.name,
            description: values.description,
            updatedAt: serverTimestamp(),
        });
        toast({ title: 'Cenário atualizado!' });
        handleCloseEditDialog();
      } catch(e) {
          const permissionError = new FirestorePermissionError({
            path: scenarioRef.path,
            operation: 'update',
            requestResourceData: values,
          });
          errorEmitter.emit('permission-error', permissionError);
      } finally {
        setIsEditing(false);
      }
  };
  
  const handleDeleteScenario = async (scenarioId: string) => {
    if (!user || !firestore) return;
    const scenarioRef = doc(firestore, 'users', user.uid, 'simulationScenarios', scenarioId);
    try {
        await deleteDoc(scenarioRef);
        toast({ title: 'Cenário apagado.' });
    } catch(e) {
        const permissionError = new FirestorePermissionError({
            path: scenarioRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={!!editingScenario} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cenário</DialogTitle>
            <DialogDescription>Refine o seu cenário de simulação. O corretor ortográfico do seu navegador está ativo.</DialogDescription>
          </DialogHeader>
           <Form {...form}>
                <form onSubmit={form.handleSubmit(handleEditScenarioSubmit)} className="space-y-4 pt-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Cenário</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição Detalhada</FormLabel>
                            <FormControl><Textarea rows={6} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={isEditing}>
                            {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Meus Cenários de Simulação</h1>
        <p className="text-muted-foreground">Crie e gira os seus próprios cenários para usar no simulador económico.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" />Criar Novo Cenário</CardTitle>
              <CardDescription>Defina uma nova hipótese para simulação. Inicie sessão para poder guardar.</CardDescription>
            </CardHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(handleNewScenarioSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome do Cenário</FormLabel>
                                <FormControl><Input placeholder="Ex: Impacto da seca na agricultura" {...field} disabled={isSubmitting || !user} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição Detalhada</FormLabel>
                                <FormControl><Textarea placeholder="Descreva as premissas, variáveis e o que pretende analisar." rows={6} {...field} disabled={isSubmitting || !user} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4">
                        <Button type="submit" disabled={isSubmitting || !user}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cenário
                        </Button>
                        {!user && !isUserLoading && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" /> <span><Link href="/login" className="font-semibold text-primary hover:underline">Inicie sessão</Link> para guardar.</span>
                            </p>
                        )}
                    </CardFooter>
                </form>
             </Form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><NotebookText className="h-5 w-5" />Cenários Guardados</CardTitle>
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
                      <div key={scenario.id} className="rounded-lg border p-4 space-y-2 group">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold pr-16">{scenario.name}</h3>
                            <div className="flex -mt-2 -mr-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(scenario)}><Edit className="h-4 w-4"/></Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Tem a certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteScenario(scenario.id)}>Apagar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
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
