
'use client';

import { useState, useTransition, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Zap, ArrowUp, ArrowDown, Info, Link as LinkIcon, GitCompareArrows, PlusCircle, Trash2, Save, User, NotebookText, Checkbox } from 'lucide-react';
import Link from 'next/link';
import { getEconomicSimulation } from '@/lib/actions';
import type { EconomicPolicySimulationOutput } from '@/ai/flows/simulate-economic-policy';
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdBanner } from '@/components/AdBanner';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox as ShadCheckbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface UserSimulationRun {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  inputVariables: string; // The policy description
  simulationResults: string; // JSON.stringified EconomicPolicySimulationOutput
  runTimestamp: any;
}


function SimulationResultDisplay({ simulation }: { simulation: EconomicPolicySimulationOutput }) {
    return (
        <div className="space-y-6">
             {simulation.isRealPolicy && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Política Real Identificada</AlertTitle>
                    <AlertDescription>
                      {simulation.source ? (
                        <Link href={simulation.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:underline">
                          <LinkIcon className="h-4 w-4" />
                          Ver Fonte Oficial
                        </Link>
                      ) : (
                        <p className="text-sm mt-2">A IA identificou esta como uma política real, mas não encontrou uma fonte oficial primária.</p>
                      )}
                    </AlertDescription>
                  </Alert>
              )}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="text-primary" />
                        <span>Sumário do Impacto</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{simulation.simulatedImpact}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Projeção de Indicadores Chave</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Indicador</TableHead>
                                <TableHead className="text-right">Valor Atual</TableHead>
                                <TableHead className="text-right">Valor Projetado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {simulation.keyIndicators.map((indicator) => (
                                <TableRow key={indicator.name}>
                                    <TableCell className="font-medium">{indicator.name}</TableCell>
                                    <TableCell className="text-right">{indicator.currentValue.toFixed(2)}{indicator.unit}</TableCell>
                                    <TableCell className="text-right font-semibold text-primary">{indicator.projectedValue.toFixed(2)}{indicator.unit}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Raciocínio da IA</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{simulation.reasoning}</p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function SimulationsPage() {
  const [policyInput, setPolicyInput] = useState('');
  const [currentSimulation, setCurrentSimulation] = useState<EconomicPolicySimulationOutput | null>(null);
  const [isSimulating, startSimulation] = useTransition();
  
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [simulationTitle, setSimulationTitle] = useState('');
  const [simulationNotes, setSimulationNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [comparisonView, setComparisonView] = useState<{ sim1: UserSimulationRun, sim2: UserSimulationRun } | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const resultRef = useRef<HTMLDivElement>(null);

  const savedSimulationsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'simulationScenarios'), orderBy('runTimestamp', 'desc'));
  }, [firestore, user]);

  const { data: savedSimulations, isLoading: isLoadingSimulations } = useCollection<UserSimulationRun>(savedSimulationsCollectionRef);

  useEffect(() => {
    const policyFromQuery = searchParams.get('policy');
    if (policyFromQuery) {
      setPolicyInput(decodeURIComponent(policyFromQuery.replace(/\+/g, ' ')));
    }
  }, [searchParams]);

  useEffect(() => {
    if ((currentSimulation || isSimulating || comparisonView) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentSimulation, isSimulating, comparisonView]);

  const handleSimulate = () => {
    if (!policyInput.trim()) return;
    setComparisonView(null);
    startSimulation(async () => {
      setCurrentSimulation(null);
      const result = await getEconomicSimulation({ policyDescription: policyInput });
      setCurrentSimulation(result);
    });
  };

  const handleSaveSimulation = async () => {
    if (!user || !firestore || !currentSimulation || !simulationTitle.trim()) {
        toast({ variant: 'destructive', title: 'Faltam dados', description: 'Por favor, dê um título à sua simulação.' });
        return;
    }
    setIsSaving(true);
    const collectionRef = collection(firestore, 'users', user.uid, 'simulationScenarios');
    const simulationData = {
        userId: user.uid,
        title: simulationTitle,
        notes: simulationNotes,
        inputVariables: policyInput,
        simulationResults: JSON.stringify(currentSimulation),
        runTimestamp: serverTimestamp(),
    };
    try {
        await addDoc(collectionRef, simulationData);
        toast({ title: 'Simulação guardada!' });
        setSaveDialogOpen(false);
        setSimulationTitle('');
        setSimulationNotes('');
    } catch (error) {
        const permissionError = new FirestorePermissionError({ path: collectionRef.path, operation: 'create', requestResourceData: simulationData });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Erro ao guardar', description: 'Não foi possível guardar a sua simulação.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteSimulation = async (id: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'simulationScenarios', id);
    try {
        await deleteDoc(docRef);
        toast({ title: 'Simulação apagada.' });
    } catch(e) {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleCompareSelection = (id: string, checked: boolean | 'indeterminate') => {
    if (checked) {
        if (selectedForComparison.length < 2) {
            setSelectedForComparison(prev => [...prev, id]);
        } else {
            toast({ variant: 'destructive', title: 'Limite atingido', description: 'Pode comparar apenas duas simulações de cada vez.'});
        }
    } else {
        setSelectedForComparison(prev => prev.filter(item => item !== id));
    }
  };

  const handleStartComparison = () => {
    if (selectedForComparison.length !== 2 || !savedSimulations) return;
    const sim1 = savedSimulations.find(s => s.id === selectedForComparison[0]);
    const sim2 = savedSimulations.find(s => s.id === selectedForComparison[1]);
    if (sim1 && sim2) {
        setCurrentSimulation(null);
        setComparisonView({ sim1, sim2 });
    }
  };

  const sim1ToCompare = comparisonView ? JSON.parse(comparisonView.sim1.simulationResults) as EconomicPolicySimulationOutput : null;
  const sim2ToCompare = comparisonView ? JSON.parse(comparisonView.sim2.simulationResults) as EconomicPolicySimulationOutput : null;


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Simulações de Políticas</h1>
        <p className="text-muted-foreground">Simule o impacto de políticas, guarde os resultados e compare diferentes cenários.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova Simulação</CardTitle>
          <CardDescription>
            Introduza a proposta que pretende simular. A IA tentará identificar se é uma proposta real e simulará o seu impacto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: 'Reduzir o IVA na restauração de 13% para 6%'"
            value={policyInput}
            onChange={(e) => setPolicyInput(e.target.value)}
            rows={4}
            disabled={isSimulating}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSimulate} disabled={isSimulating || !policyInput.trim()}>
            {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {isSimulating ? 'A simular...' : 'Simular Impacto'}
          </Button>
        </CardFooter>
      </Card>
      
      <AdBanner />
      
      <div ref={resultRef}>
        {isSimulating && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {(currentSimulation || comparisonView) && (
            <div className="space-y-6">
                <Separator />
                <div>
                    <h2 className="text-2xl font-bold font-headline tracking-tight">Resultados da Análise</h2>
                </div>
            </div>
        )}

        {currentSimulation && (
            <div className="pt-6 space-y-6">
                <div className="flex justify-end">
                     <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" disabled={!user}>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Simulação
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>Guardar Simulação</DialogTitle>
                            <DialogDescription>Dê um nome e notas a esta simulação para a encontrar mais tarde.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sim-title">Título</Label>
                                    <Input id="sim-title" value={simulationTitle} onChange={(e) => setSimulationTitle(e.target.value)} placeholder="Ex: Redução do IVA na restauração" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sim-notes">Notas (Opcional)</Label>
                                    <Textarea id="sim-notes" value={simulationNotes} onChange={(e) => setSimulationNotes(e.target.value)} placeholder="Uma breve nota sobre esta simulação." />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                                <Button onClick={handleSaveSimulation} disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <SimulationResultDisplay simulation={currentSimulation} />
            </div>
        )}

        {comparisonView && sim1ToCompare && sim2ToCompare && (
             <div className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card><CardHeader><CardTitle>{comparisonView.sim1.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground line-clamp-2">{comparisonView.sim1.inputVariables}</p></CardContent></Card>
                <Card><CardHeader><CardTitle>{comparisonView.sim2.title}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground line-clamp-2">{comparisonView.sim2.inputVariables}</p></CardContent></Card>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                   <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <Zap className="text-primary" />
                              <span>Sumário (1)</span>
                          </CardTitle>
                      </CardHeader>
                      <CardContent><p className="text-muted-foreground">{sim1ToCompare.simulatedImpact}</p></CardContent>
                  </Card>
                  <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <Zap className="text-primary" />
                              <span>Sumário (2)</span>
                          </CardTitle>
                      </CardHeader>
                      <CardContent><p className="text-muted-foreground">{sim2ToCompare.simulatedImpact}</p></CardContent>
                  </Card>
              </div>

              <Card>
                  <CardHeader><CardTitle>Comparação de Indicadores Chave</CardTitle></CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Indicador</TableHead>
                                  <TableHead className="text-right">Simulação 1</TableHead>
                                  <TableHead className="text-right">Simulação 2</TableHead>
                                  <TableHead className="text-right">Diferença (2 vs 1)</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {sim1ToCompare.keyIndicators.map((indicator1, index) => {
                                  const indicator2 = sim2ToCompare.keyIndicators[index];
                                  if (!indicator2 || indicator1.name !== indicator2.name) return null;
                                  const diff = indicator2.projectedValue - indicator1.projectedValue;
                                  return (
                                      <TableRow key={indicator1.name}>
                                          <TableCell className="font-medium">{indicator1.name}</TableCell>
                                          <TableCell className="text-right font-semibold">{indicator1.projectedValue.toFixed(2)}{indicator1.unit}</TableCell>
                                          <TableCell className="text-right font-semibold text-primary">{indicator2.projectedValue.toFixed(2)}{indicator2.unit}</TableCell>
                                          <TableCell className="text-right">
                                              <span className={`flex items-center justify-end gap-1 ${diff === 0 ? 'text-muted-foreground' : diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                  {diff !== 0 && (diff > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                                                  {diff === 0 ? '-' : `${Math.abs(diff).toFixed(2)}${indicator1.unit}`}
                                              </span>
                                          </TableCell>
                                      </TableRow>
                                  );
                              })}
                          </TableBody>
                      </Table>
                  </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card><CardHeader><CardTitle>Raciocínio (1)</CardTitle></CardHeader><CardContent><p className="text-muted-foreground whitespace-pre-wrap">{sim1ToCompare.reasoning}</p></CardContent></Card>
                  <Card><CardHeader><CardTitle>Raciocínio (2)</CardTitle></CardHeader><CardContent><p className="text-muted-foreground whitespace-pre-wrap">{sim2ToCompare.reasoning}</p></CardContent></Card>
              </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                 <h2 className="text-2xl font-bold font-headline tracking-tight">Minhas Simulações Guardadas</h2>
                 <p className="text-muted-foreground">Reveja, apague ou compare as suas simulações anteriores.</p>
            </div>
            <Button onClick={handleStartComparison} disabled={selectedForComparison.length !== 2}>
                <GitCompareArrows className="mr-2 h-4 w-4" />
                Comparar Selecionados ({selectedForComparison.length}/2)
            </Button>
        </div>

        { !user && (
          <Card className="flex flex-col items-center justify-center text-center py-12">
            <CardHeader>
                <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <CardTitle className="mt-4">Inicie sessão para ver as suas simulações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Guarde análises para criar a sua biblioteca pessoal.</p>
              <Button asChild className="mt-4"><Link href="/login">Iniciar Sessão</Link></Button>
            </CardContent>
          </Card>
        )}
        { user && isLoadingSimulations && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
        )}
        { user && !isLoadingSimulations && savedSimulations && savedSimulations.length > 0 ? (
            <div className="space-y-4">
            {savedSimulations.map((sim) => (
              <Card key={sim.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <ShadCheckbox 
                    id={`compare-${sim.id}`} 
                    onCheckedChange={(checked) => handleCompareSelection(sim.id, checked)}
                    checked={selectedForComparison.includes(sim.id)}
                    disabled={selectedForComparison.length >= 2 && !selectedForComparison.includes(sim.id)}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{sim.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{sim.inputVariables}</p>
                     <p className="text-xs text-muted-foreground">
                        Guardado em: {new Date(sim.runTimestamp?.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                   <div className="flex items-center">
                        <Button variant="outline" size="sm" onClick={() => { setCurrentSimulation(JSON.parse(sim.simulationResults)); setComparisonView(null); }}>Ver</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Tem a certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteSimulation(sim.id)}>Apagar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : user && !isLoadingSimulations && (
           <Card className="flex flex-col items-center justify-center text-center py-12">
            <CardHeader>
                <NotebookText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <CardTitle className="mt-4">Nenhuma simulação guardada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Use o formulário acima para criar e guardar a sua primeira simulação.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
