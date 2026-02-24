
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, doc, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { getScenarioAnalysis } from '@/lib/actions';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, Info, Save, RefreshCcw, Share2, TrendingUp, Briefcase, Activity, 
  Landmark, Sparkles, Loader2, Check, Target, PlusCircle, Scale, Wallet, Coins
} from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { cn } from '@/lib/utils';

// --- Economic Engine Constants (Reality 2026) ---
const REALITY_2026 = {
  irs: 25, // Taxa média
  iva: 23, // Taxa standard
  irc: 21, // Taxa IRC base
  investment: 2.5, // % PIB
  smn: 870, // Salário Mínimo projetado 2026
  gdp: 2.4, // Crescimento base
  unemployment: 6.1, // Taxa base
  inflation: 2.0, // IHPC base
  debt: 88.5, // % PIB base
  balance: 0.2 // % PIB base (Superávit)
};

export default function ScenariosPage() {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // --- UI State ---
  const [params, setParams] = useState({ 
    irs: REALITY_2026.irs, 
    iva: REALITY_2026.iva, 
    irc: REALITY_2026.irc,
    investment: REALITY_2026.investment,
    smn: REALITY_2026.smn
  });
  
  const [results, setResults] = useState({
    gdp: REALITY_2026.gdp,
    unemployment: REALITY_2026.unemployment,
    inflation: REALITY_2026.inflation,
    debt: REALITY_2026.debt,
    balance: REALITY_2026.balance
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalysing, startAnalysis] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Suggestion State ---
  const [isSuggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [suggestText, setSuggestText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // --- Economic Engine Logic ---
  useEffect(() => {
    // Cálculo de desvios
    const dIrs = params.irs - REALITY_2026.irs;
    const dIva = params.iva - REALITY_2026.iva;
    const dIrc = params.irc - REALITY_2026.irc;
    const dInvest = params.investment - REALITY_2026.investment;
    const dSmn = (params.smn - REALITY_2026.smn) / 10; // Normalizado por cada 10€

    // 1. PIB (Crescimento)
    // Mais investimento (+) | Menos IRS (+) | Menos IRC (Competitividade +) | SMN (Consumo + mas custo empresas -)
    const gdpShift = ((-0.1 * dIrs) + (-0.12 * dIva) + (-0.08 * dIrc) + (0.35 * dInvest) + (0.02 * dSmn));
    const newGdp = Math.max(-5, REALITY_2026.gdp + gdpShift);

    // 2. Desemprego (Lei de Okun)
    const growthGap = newGdp - 2.0;
    const unempShift = (-0.35 * growthGap) + (0.01 * dSmn); // SMN alto sobe ligeiro desemprego
    const newUnemp = Math.max(3, REALITY_2026.unemployment + unempShift);

    // 3. Inflação (Procura e Custos)
    const inflShift = (0.2 * growthGap) + (0.25 * dIva) + (0.05 * dSmn);
    const newInfl = Math.max(-1, REALITY_2026.inflation + inflShift);

    // 4. Saldo Orçamental (Simplificado)
    // Receita: Sobes impostos (+) | Despesa: Sobes investimento e SMN público (-)
    const revenueImpact = (0.4 * dIrs) + (0.5 * dIva) + (0.2 * dIrc);
    const spendingImpact = (1.0 * dInvest) + (0.05 * dSmn);
    const newBalance = REALITY_2026.balance + revenueImpact - spendingImpact;

    // 5. Dívida Pública
    // Se há défice (Balance < 0), a dívida sobe. Se o PIB cresce, o rácio desce.
    const debtShift = (-0.8 * growthGap) - (1.2 * newBalance);
    const newDebt = Math.max(50, REALITY_2026.debt + debtShift);

    setResults({
      gdp: parseFloat(newGdp.toFixed(2)),
      unemployment: parseFloat(newUnemp.toFixed(2)),
      inflation: parseFloat(newInfl.toFixed(2)),
      debt: parseFloat(newDebt.toFixed(2)),
      balance: parseFloat(newBalance.toFixed(2))
    });
  }, [params]);

  // --- Actions ---
  const handleReset = () => {
    setParams({ 
      irs: REALITY_2026.irs, 
      iva: REALITY_2026.iva, 
      irc: REALITY_2026.irc, 
      investment: REALITY_2026.investment, 
      smn: REALITY_2026.smn 
    });
    setAiAnalysis(null);
  };

  const handleGetAnalysis = () => {
    startAnalysis(async () => {
      const res = await getScenarioAnalysis({ parameters: params, results }, language);
      setAiAnalysis(res.feedback);
    });
  };

  const handleSave = async () => {
    if (!user || !firestore || !scenarioTitle.trim()) return;
    setIsSaving(true);
    try {
      const scenarioData = {
        userId: user.uid,
        userName: user.displayName,
        title: scenarioTitle,
        parameters: params,
        results: results,
        aiFeedback: aiAnalysis,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(firestore, 'publicScenarios'), scenarioData);
      toast({ title: t('common.success') });
      setSaveDialogOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: t('common.error') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggest = async () => {
    if (!user || !firestore || !suggestText.trim()) return;
    setIsSuggesting(true);
    try {
      await addDoc(collection(firestore, 'contactMessages'), {
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        subject: 'Sugestão de Indicador Macro',
        message: `Sugestão de nova variável/indicador para o Laboratório: ${suggestText}`,
        status: 'new',
        createdAt: serverTimestamp()
      });
      toast({ title: t('common.success'), description: 'Sugestão enviada para a equipa técnica.' });
      setSuggestDialogOpen(false);
      setSuggestText('');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('irs', params.irs.toString());
    url.searchParams.set('iva', params.iva.toString());
    url.searchParams.set('irc', params.irc.toString());
    url.searchParams.set('inv', params.investment.toString());
    url.searchParams.set('smn', params.smn.toString());
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    toast({ title: t('common.linkCopied') });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const pIrs = searchParams.get('irs');
    const pIva = searchParams.get('iva');
    const pIrc = searchParams.get('irc');
    const pInv = searchParams.get('inv');
    const pSmn = searchParams.get('smn');
    if (pIrs && pIva) {
      setParams({
        irs: parseFloat(pIrs),
        iva: parseFloat(pIva),
        irc: pIrc ? parseFloat(pIrc) : REALITY_2026.irc,
        investment: pInv ? parseFloat(pInv) : REALITY_2026.investment,
        smn: pSmn ? parseFloat(pSmn) : REALITY_2026.smn
      });
    }
  }, [searchParams]);

  const publicScenariosQuery = useMemoFirebase(() => query(collection(firestore, 'publicScenarios'), orderBy('createdAt', 'desc'), limit(6)), [firestore]);
  const { data: publicScenarios } = useCollection<any>(publicScenariosQuery);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">{t('scenarios.title')}</h1>
            <p className="text-muted-foreground text-lg">{t('scenarios.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> {t('scenarios.reset')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
              {t('common.share')}
            </Button>
          </div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border border-muted flex gap-3 items-start mt-2">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('scenarios.howItWorks')}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* --- Inputs Column --- */}
        <Card className="border-primary/10 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Landmark className="text-primary" /> {t('scenarios.inputs')}</CardTitle>
              <CardDescription>Configure as políticas para 2026.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold" onClick={() => setSuggestDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5 mr-1" /> {t('scenarios.suggestIndicator')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">
            {/* IRS */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">{t('scenarios.irsLabel')} <TooltipProvider><Tooltip><TooltipTrigger><Info className="h-3 w-3 opacity-50" /></TooltipTrigger><TooltipContent>{t('scenarios.tooltips.irs')}</TooltipContent></Tooltip></TooltipProvider></Label>
                <Badge variant="secondary" className="font-mono">{params.irs}%</Badge>
              </div>
              <Slider value={[params.irs]} onValueChange={([v]) => setParams(p => ({ ...p, irs: v }))} min={10} max={45} step={0.5} />
            </div>

            {/* IVA */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">{t('scenarios.ivaLabel')} <TooltipProvider><Tooltip><TooltipTrigger><Info className="h-3 w-3 opacity-50" /></TooltipTrigger><TooltipContent>{t('scenarios.tooltips.iva')}</TooltipContent></Tooltip></TooltipProvider></Label>
                <Badge variant="secondary" className="font-mono">{params.iva}%</Badge>
              </div>
              <Slider value={[params.iva]} onValueChange={([v]) => setParams(p => ({ ...p, iva: v }))} min={15} max={30} step={0.5} />
            </div>

            {/* IRC */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">{t('scenarios.ircLabel')} <TooltipProvider><Tooltip><TooltipTrigger><Info className="h-3 w-3 opacity-50" /></TooltipTrigger><TooltipContent>{t('scenarios.tooltips.irc')}</TooltipContent></Tooltip></TooltipProvider></Label>
                <Badge variant="secondary" className="font-mono">{params.irc}%</Badge>
              </div>
              <Slider value={[params.irc]} onValueChange={([v]) => setParams(p => ({ ...p, irc: v }))} min={10} max={30} step={0.5} />
            </div>

            {/* Investimento */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">{t('scenarios.investLabel')} <TooltipProvider><Tooltip><TooltipTrigger><Info className="h-3 w-3 opacity-50" /></TooltipTrigger><TooltipContent>{t('scenarios.tooltips.invest')}</TooltipContent></Tooltip></TooltipProvider></Label>
                <Badge variant="secondary" className="font-mono">{params.investment}%</Badge>
              </div>
              <Slider value={[params.investment]} onValueChange={([v]) => setParams(p => ({ ...p, investment: v }))} min={0.5} max={10} step={0.1} />
            </div>

            {/* SMN */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">{t('scenarios.smnLabel')} <TooltipProvider><Tooltip><TooltipTrigger><Info className="h-3 w-3 opacity-50" /></TooltipTrigger><TooltipContent>{t('scenarios.tooltips.smn')}</TooltipContent></Tooltip></TooltipProvider></Label>
                <Badge variant="secondary" className="font-mono">{params.smn}€</Badge>
              </div>
              <Slider value={[params.smn]} onValueChange={([v]) => setParams(p => ({ ...p, smn: v }))} min={820} max={1200} step={5} />
            </div>
          </CardContent>
        </Card>

        {/* --- Outputs Column --- */}
        <div className="space-y-6">
          <Card className="border-accent/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><Activity className="text-accent" /> {t('scenarios.outputs')}</CardTitle>
              <CardDescription>Impacto nas projeções oficiais de 2026.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* GDP */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-primary" /> {t('scenarios.gdpLabel')}</span>
                  <span className={cn(results.gdp > 2.4 ? "text-green-600" : "text-amber-600")}>{results.gdp}%</span>
                </div>
                <Progress value={Math.min(100, (results.gdp + 5) * 10)} className="h-1.5" />
              </div>

              {/* Unemployment */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-primary" /> {t('scenarios.unemploymentLabel')}</span>
                  <span className={cn(results.unemployment < 6.1 ? "text-green-600" : "text-red-600")}>{results.unemployment}%</span>
                </div>
                <Progress value={results.unemployment * 5} className="h-1.5" />
              </div>

              {/* Public Debt */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-primary" /> {t('scenarios.debtLabel')}</span>
                  <span className={cn(results.debt < 88.5 ? "text-green-600" : "text-red-600")}>{results.debt}%</span>
                </div>
                <Progress value={results.debt - 50} className="h-1.5" />
              </div>

              {/* Budget Balance */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="flex items-center gap-1.5"><Coins className="h-3.5 w-3.5 text-primary" /> {t('scenarios.balanceLabel')}</span>
                  <span className={cn(results.balance >= 0 ? "text-green-600" : "text-red-600")}>{results.balance}%</span>
                </div>
                <Progress value={50 + results.balance * 10} className="h-1.5" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 py-4 flex justify-between">
              <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="gap-2" disabled={!user}>
                    <Save className="h-4 w-4" /> {t('scenarios.saveTitle')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{t('scenarios.saveTitle')}</DialogTitle><DialogDescription>{t('scenarios.saveDesc')}</DialogDescription></DialogHeader>
                  <div className="py-4 space-y-2"><Label>Título do Cenário</Label><Input value={scenarioTitle} onChange={(e) => setScenarioTitle(e.target.value)} placeholder="Ex: Portugal Competitivo 2026" /></div>
                  <DialogFooter><DialogClose asChild><Button variant="ghost">{t('common.cancel')}</Button></DialogClose><Button onClick={handleSave} disabled={isSaving || !scenarioTitle.trim()}>{isSaving && <Loader2 className="mr-2 animate-spin h-4 w-4" />} {t('common.save')}</Button></DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleGetAnalysis} disabled={isAnalysing}>
                {isAnalysing ? <Loader2 className="mr-2 animate-spin h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4 text-accent fill-accent" />}
                Parecer IA
              </Button>
            </CardFooter>
          </Card>

          {aiAnalysis && (
            <Card className="border-accent bg-accent/5 border-dashed">
              <CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2 text-accent"><Sparkles className="h-3.5 w-3.5" /> {t('scenarios.aiAnalysis')}</CardTitle></CardHeader>
              <CardContent><p className="text-xs leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p></CardContent>
            </Card>
          )}
        </div>
      </div>

      <AdBanner />

      {/* --- Public Scenarios --- */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" /> {t('scenarios.publicScenarios')}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publicScenarios?.map((s: any) => (
            <Card key={s.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => setParams(s.parameters)}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm line-clamp-1 group-hover:text-primary transition-colors">{s.title}</CardTitle>
                <CardDescription className="text-[10px]">Por {s.userName || 'Cidadão'}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-[10px] p-1.5 rounded bg-muted/50 flex justify-between"><span>PIB</span><b>{s.results.gdp}%</b></div>
                  <div className="text-[10px] p-1.5 rounded bg-muted/50 flex justify-between"><span>Saldo</span><b>{s.results.balance}%</b></div>
                </div>
              </CardContent>
              <CardFooter className="p-2 border-t bg-muted/10 flex justify-center"><span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Activity className="h-3 w-3" /> Carregar</span></CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* --- Suggestion Dialog --- */}
      <Dialog open={isSuggestDialogOpen} onOpenChange={setSuggestDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('scenarios.suggestIndicator')}</DialogTitle><DialogDescription>{t('scenarios.suggestIndicatorDesc')}</DialogDescription></DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea placeholder="Ex: Gostaria de ver o impacto no rácio de natalidade ou no custo da eletricidade..." value={suggestText} onChange={(e) => setSuggestText(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">{t('common.cancel')}</Button></DialogClose>
            <Button onClick={handleSuggest} disabled={isSuggesting || !suggestText.trim()}>{isSuggesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('common.submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
