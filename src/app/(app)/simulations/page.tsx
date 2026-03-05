
"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Zap, Info, Link as LinkIcon, Save, Trash2, MessageSquarePlus, PlusCircle, Share2, Check, Languages, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { getEconomicSimulation, getTranslation, type EconomicSimulationOutput } from '@/lib/server-actions';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, orderBy, doc, limit, setDoc, getDoc, deleteDoc, addDoc, where, getDocs } from 'firebase/firestore';
import { useTranslation } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { RefutationDialog } from '@/components/RefutationDialog';
import { safeDecode } from '@/lib/safe-decode';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const MAX_CACHE_LENGTH = 1000;

interface UserSimulationRun {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  inputVariables: string;
  simulationResults: string;
  runTimestamp: any;
}

interface PublicSimulationRun {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  title: string;
  inputVariables: string;
  simulationResults: string;
  runTimestamp: any;
}

function generateSlug(text: string): string {
  if (!text) return '';
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 150);
}

function SimulationResultDisplay({ simulation, policyText }: { simulation: EconomicSimulationOutput, policyText: string }) {
    const { t, language } = useTranslation();
    const { toast } = useToast();
    const firestore = useFirestore();
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    
    const [isTranslating, startTransition] = useTransition();
    const [translated, setTranslated] = useState<{ impact: string, reasoning: string } | null>(null);
    const [showOriginal, setShowOriginal] = useState(true);

    useEffect(() => {
        if (language === 'en' && simulation) {
            const checkCache = async () => {
                const cacheRef = collection(firestore, 'translations_cache');
                const fetchCached = async (text: string) => {
                    if (!text || text.length > MAX_CACHE_LENGTH) return null;
                    const q = query(cacheRef, where('originalText', '==', text), where('targetLanguage', '==', 'English'), limit(1));
                    const snap = await getDocs(q);
                    return !snap.empty ? snap.docs[0].data().translatedText : null;
                };
                const [tImpact, tReasoning] = await Promise.all([
                    fetchCached(simulation.simulatedImpact),
                    fetchCached(simulation.reasoning)
                ]);
                if (tImpact && tReasoning) {
                    setTranslated({ impact: tImpact, reasoning: tReasoning });
                    setShowOriginal(false);
                }
            };
            checkCache();
        } else {
            setTranslated(null);
            setShowOriginal(true);
        }
    }, [language, simulation, firestore]);

    const handleTranslate = () => {
        startTransition(async () => {
            const resImpact = await getTranslation(simulation.simulatedImpact, language);
            const resReasoning = await getTranslation(simulation.reasoning, language);
            setTranslated({ impact: resImpact, reasoning: resReasoning });
            setShowOriginal(false);
            
            const cacheRef = collection(firestore, 'translations_cache');
            const saveToCache = (orig: string, trans: string) => {
                if (orig.length > MAX_CACHE_LENGTH) return;
                addDoc(cacheRef, { originalText: orig, translatedText: trans, targetLanguage: 'English', createdAt: serverTimestamp() });
            };
            saveToCache(simulation.simulatedImpact, resImpact);
            saveToCache(simulation.reasoning, resReasoning);
        });
    };

    const handleConvertToProposal = () => {
        const params = new URLSearchParams();
        params.set('title', policyText.substring(0, 100));
        params.set('description', `Impacto Simulado: ${simulation.simulatedImpact}\n\nRaciocínio: ${simulation.reasoning}`);
        router.push(`/proposals?${params.toString()}`);
    };

    const handleCopyLink = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('policy', policyText);
        navigator.clipboard.writeText(url.toString());
        setCopied(true);
        toast({ title: t('common.linkCopied') });
        setTimeout(() => setCopied(false), 2000);
    };

    const currentImpact = !showOriginal && translated ? translated.impact : simulation.simulatedImpact;
    const currentReasoning = !showOriginal && translated ? translated.reasoning : simulation.reasoning;

    return (
        <div className="space-y-6">
             <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2">
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
                      {t('common.share')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleConvertToProposal} className="gap-2 text-accent border-accent/20 hover:bg-accent/10">
                      <MessageSquarePlus className="h-4 w-4" />
                      {t('simulations.convertToProposal')}
                  </Button>
                  {language !== 'pt' && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={translated ? () => setShowOriginal(!showOriginal) : handleTranslate} 
                        disabled={isTranslating} 
                        className="h-8 text-[10px] uppercase font-bold tracking-wider border-accent/50 text-accent hover:bg-accent/10 hover:text-accent"
                    >
                        {isTranslating ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : translated ? <RefreshCw className="mr-1.5 h-3 w-3" /> : <Languages className="mr-1.5 h-3 w-3" />}
                        {isTranslating ? t('common.translating') : (translated ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate'))}
                    </Button>
                  )}
                  <RefutationDialog contentId={`simulation-${generateSlug(policyText)}`} />
             </div>

             {simulation.isRealPolicy && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t('simulations.realPolicy')}</AlertTitle>
                    <AlertDescription>
                      {simulation.source && (
                        <Link href={simulation.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:underline">
                          <LinkIcon className="h-4 w-4" />
                          {t('simulations.viewOfficial')}
                        </Link>
                      )}
                    </AlertDescription>
                  </Alert>
              )}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="text-primary" />
                        <span>{t('simulations.impactSummary')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{currentImpact}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('simulations.indicatorsTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('simulations.indicator')}</TableHead>
                                    <TableHead className="text-right">{t('simulations.currentValue')}</TableHead>
                                    <TableHead className="text-right">{t('simulations.projectedValue')}</TableHead>
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
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('simulations.aiReasoning')}</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{currentReasoning}</p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function SimulationsPage() {
  const { t, language } = useTranslation();
  const [policyInput, setPolicyInput] = useState('');
  const [currentSimulation, setCurrentSimulation] = useState<EconomicSimulationOutput | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [simulationTitle, setSimulationTitle] = useState('');
  const [simulationNotes, setSimulationNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [isVarDialogOpen, setVarDialogOpen] = useState(false);
  const [varName, setVarName] = useState('');
  const [varReason, setVarReason] = useState('');
  const [isSuggestingVar, setIsSuggestingVar] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<string | null>(null);
  const searchParams = useSearchParams();

  const performSimulation = useCallback(async (text: string) => {
    if (!text || !text.trim()) return;
    
    setIsSimulating(true);
    setCurrentSimulation(null);
    const normalizedText = text.trim();
    setPolicyInput(normalizedText);

    try {
      const policyId = generateSlug(normalizedText);
      if (firestore) {
        const publicRef = doc(firestore, 'publicSimulations', policyId);
        const snap = await getDoc(publicRef);
        if (snap.exists()) {
          const cached = snap.data();
          if (cached.simulationResults) {
            setCurrentSimulation(JSON.parse(cached.simulationResults));
            setIsSimulating(false);
            return;
          }
        }
      }

      const result = await getEconomicSimulation({ policyDescription: normalizedText }, language);
      setCurrentSimulation(result);

      if (firestore) {
          const policyId = generateSlug(normalizedText);
          setDoc(doc(firestore, 'publicSimulations', policyId), {
              userId: user?.uid || 'anon',
              userName: user?.displayName || 'Cidadão',
              userPhotoURL: user?.photoURL || '',
              title: normalizedText,
              inputVariables: normalizedText,
              simulationResults: JSON.stringify(result),
              runTimestamp: serverTimestamp(),
          }, { merge: true }).catch(() => {});
      }
    } finally {
      setIsSimulating(false);
    }
  }, [language, firestore, user]);

  useEffect(() => {
    const policy = searchParams.get('policy');
    if (policy && policy !== processedRef.current) {
      processedRef.current = policy;
      const decoded = safeDecode(policy);
      performSimulation(decoded);
    }
  }, [searchParams, performSimulation]);

  useEffect(() => {
    if (currentSimulation && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentSimulation]);

  const savedSimsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'simulationScenarios'), orderBy('runTimestamp', 'desc'), limit(10));
  }, [firestore, user]);
  const { data: savedSimulations, isLoading: isLoadingSimulations } = useCollection<UserSimulationRun>(savedSimsQuery);
  
  const publicSimsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'publicSimulations'), orderBy('runTimestamp', 'desc'), limit(10));
  }, [firestore]);
  const { data: publicSimulations, isLoading: isLoadingPublic } = useCollection<PublicSimulationRun>(publicSimsQuery);

  const handleSaveSimulation = async () => {
    if (!user || !firestore || !currentSimulation || !simulationTitle.trim()) return;
    setIsSaving(true);
    const policyId = generateSlug(policyInput);
    const simData = {
        userId: user.uid,
        title: simulationTitle,
        notes: simulationNotes,
        inputVariables: policyInput,
        simulationResults: JSON.stringify(currentSimulation),
        runTimestamp: serverTimestamp(),
    };
    try {
        await setDoc(doc(firestore, 'users', user.uid, 'simulationScenarios', policyId), simData, { merge: true });
        toast({ title: t('common.success') });
        setSaveDialogOpen(false);
    } catch (e) {
        toast({ variant: 'destructive', title: t('common.error') });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSuggestVar = async () => {
    if (!user || !firestore || !varName.trim()) return;
    setIsSuggestingVar(true);
    try {
      await addDoc(collection(firestore, 'contactMessages'), {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        subject: `Sugestão de Variável: ${varName}`,
        message: `Sugestão de nova variável para o simulador:\n\nNome: ${varName}\nMotivo: ${varReason}`,
        status: 'new',
        createdAt: serverTimestamp()
      });
      toast({ title: t('common.success'), description: 'Sugestão de indicador enviada.' });
      setVarDialogOpen(false);
      setVarName(''); setVarReason('');
    } catch (e) {
      toast({ variant: 'destructive', title: t('common.error') });
    } finally {
      setIsSuggestingVar(false);
    }
  };

  const handleDeleteSavedSimulation = async (id: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'simulationScenarios', id));
      toast({ title: t('common.success') });
    } catch (e) {
      toast({ variant: 'destructive', title: t('common.error') });
    } finally {
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">{t('simulations.title')}</h1>
            <p className="text-muted-foreground">{t('simulations.description')}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setVarDialogOpen(true)} disabled={!user}>
            <PlusCircle className="h-4 w-4" />
            {t('simulations.suggestVariable')}
          </Button>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border border-muted flex gap-3 items-start mt-2">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('simulations.howItWorks')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('simulations.newSimTitle')}</CardTitle>
          <CardDescription>{t('simulations.newSimDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t('simulations.textareaPlaceholder')}
            value={policyInput}
            onChange={(e) => setPolicyInput(e.target.value)}
            rows={4}
            disabled={isSimulating}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={() => performSimulation(policyInput)} disabled={isSimulating || !policyInput.trim()}>
            {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {isSimulating ? t('simulations.simulating') : t('simulations.simulateBtn')}
          </Button>
        </CardFooter>
      </Card>
      
      <div ref={resultRef} className="scroll-mt-20">
        {isSimulating && (
          <div className="space-y-4 pt-6">
            <Skeleton className="h-40 w-full" />
          </div>
        )}
        {currentSimulation && !isSimulating && (
            <div className="pt-6 space-y-6">
                <div className="flex justify-end">
                     <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" disabled={!user}>
                                <Save className="mr-2 h-4 w-4" />
                                {t('simulations.saveBtn')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>{t('simulations.saveBtn')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <Label>{t('dashboard.viewName')}</Label>
                                <Input value={simulationTitle} onChange={(e) => setSimulationTitle(e.target.value)} />
                                <Label>{t('dashboard.viewDescription')}</Label>
                                <Textarea value={simulationNotes} onChange={(e) => setSimulationNotes(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost">{t('common.cancel')}</Button>
                                </DialogClose>
                                <Button onClick={handleSaveSimulation} disabled={isSaving}>{t('common.save')}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <SimulationResultDisplay simulation={currentSimulation} policyText={policyInput} />
            </div>
        )}
      </div>

      <Separator />
      <h2 className="text-2xl font-bold">{t('simulations.mySimsTitle')}</h2>
      {!user ? <p className="text-muted-foreground">{t('nav.login')}</p> : isLoadingSimulations ? <Skeleton className="h-20 w-full" /> : (
          <div className="space-y-4">
              {savedSimulations?.map(sim => (
                  <Card key={sim.id} className="p-4 flex justify-between items-center group hover:bg-muted/30 transition-colors">
                      <div className="cursor-pointer flex-1" onClick={() => {
                          const parsed = JSON.parse(sim.simulationResults);
                          setCurrentSimulation(parsed);
                          setPolicyInput(sim.inputVariables);
                        }}>
                          <h3 className="font-semibold">{sim.title}</h3>
                          <p className="text-sm text-muted-foreground italic line-clamp-1">"{sim.inputVariables}"</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          const parsed = JSON.parse(sim.simulationResults);
                          setCurrentSimulation(parsed);
                          setPolicyInput(sim.inputVariables);
                        }}>
                            {t('common.view')}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('common.warning')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('common.confirm_delete')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSavedSimulation(sim.id)} className="bg-destructive text-destructive-foreground">{t('common.delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                  </Card>
              ))}
          </div>
      )}

      <Separator />
      <h2 className="text-2xl font-bold">{t('simulations.publicSimsTitle')}</h2>
      {isLoadingPublic ? <Skeleton className="h-20 w-full" /> : (
          <div className="grid gap-6 md:grid-cols-2">
              {publicSimulations?.map(sim => (
                  <Card key={sim.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={sim.userPhotoURL} />
                                <AvatarFallback>{sim.userName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{sim.userName}</span>
                          </div>
                          <RefutationDialog contentId={`simulation-${sim.id}`} />
                      </div>
                      <h3 className="font-semibold">{sim.title || sim.inputVariables}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 italic">"{sim.inputVariables}"</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => {
                        const parsed = JSON.parse(sim.simulationResults);
                        setCurrentSimulation(parsed);
                        setPolicyInput(sim.inputVariables);
                      }}>
                          {t('common.view')}
                      </Button>
                  </Card>
              ))}
          </div>
      )}

      <Dialog open={isVarDialogOpen} onOpenChange={setVarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('simulations.suggestVariable')}</DialogTitle>
            <DialogDescription>{t('simulations.suggestVariableDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('simulations.variableName')}</Label>
              <Input placeholder="Ex: Custo médio da energia industrial" value={varName} onChange={(e) => setVarName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('simulations.variableReason')}</Label>
              <Textarea placeholder="Explique porque este indicador ajudaria a simular políticas melhor..." value={varReason} onChange={(e) => setVarReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t('common.cancel')}</Button></DialogClose>
            <Button onClick={handleSuggestVar} disabled={isSuggestingVar || !varName.trim()}>
              {isSuggestingVar && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
