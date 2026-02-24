
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, doc, setDoc, getDoc, addDoc, query, orderBy, limit } from 'firebase/firestore';
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
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Zap, Info, Save, RefreshCcw, Share2, TrendingUp, TrendingDown, 
  Briefcase, Activity, Landmark, Sparkles, Loader2, Share, Check, 
  Target, BarChart3, LineChart, PieChart
} from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { cn } from '@/lib/utils';

// --- Economic Engine Constants (Reality 2026) ---
const REALITY_2026 = {
  irs: 25, // Taxa média
  iva: 23, // Taxa standard
  investment: 2.5, // % PIB
  gdp: 2.4, // Crescimento
  unemployment: 6.1, // Taxa
  inflation: 2.0 // IHPC
};

interface ScenarioState {
  irs: number;
  iva: number;
  investment: number;
  gdp: number;
  unemployment: number;
  inflation: number;
}

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
    investment: REALITY_2026.investment 
  });
  const [results, setResults] = useState({
    gdp: REALITY_2026.gdp,
    unemployment: REALITY_2026.unemployment,
    inflation: REALITY_2026.inflation
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalysing, startAnalysis] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Economic Engine Logic ---
  useEffect(() => {
    // Calculamos desvios face à realidade
    const dIrs = params.irs - REALITY_2026.irs;
    const dIva = params.iva - REALITY_2026.iva;
    const dInvest = params.investment - REALITY_2026.investment;

    // 1. Impacto no PIB (Consumo e Investimento)
    // IRS (-) estimula consumo; IVA (-) estimula consumo; Investimento (+) estimula PIB direto
    const gdpShift = ((-0.12 * dIrs) + (-0.15 * dIva) + (0.4 * dInvest));
    const newGdp = Math.max(-5, REALITY_2026.gdp + gdpShift);

    // 2. Desemprego (Lei de Okun adaptada)
    // Se o PIB cresce acima de 2%, o desemprego cai. Se cai, o desemprego sobe.
    const growthGap = newGdp - 2.0;
    const unempShift = -0.4 * growthGap;
    const newUnemp = Math.max(3, REALITY_2026.unemployment + unempShift);

    // 3. Inflação (Procura e Custos)
    // Mais PIB (+) -> Mais inflação; Mais IVA (+) -> Mais inflação direta
    const inflShift = (0.25 * growthGap) + (0.3 * dIva);
    const newInfl = Math.max(-1, REALITY_2026.inflation + inflShift);

    setResults({
      gdp: parseFloat(newGdp.toFixed(2)),
      unemployment: parseFloat(newUnemp.toFixed(2)),
      inflation: parseFloat(newInfl.toFixed(2))
    });
  }, [params]);

  // --- Actions ---
  const handleReset = () => {
    setParams({ irs: REALITY_2026.irs, iva: REALITY_2026.iva, investment: REALITY_2026.investment });
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

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('irs', params.irs.toString());
    url.searchParams.set('iva', params.iva.toString());
    url.searchParams.set('inv', params.investment.toString());
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    toast({ title: t('common.linkCopied') });
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Load Shared State ---
  useEffect(() => {
    const pIrs = searchParams.get('irs');
    const pIva = searchParams.get('iva');
    const pInv = searchParams.get('inv');
    if (pIrs && pIva && pInv) {
      setParams({
        irs: parseFloat(pIrs),
        iva: parseFloat(pIva),
        investment: parseFloat(pInv)
      });
    }
  }, [searchParams]);

  // --- Public Scenarios ---
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
        <Card className="border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="text-primary" /> {t('scenarios.inputs')}</CardTitle>
            <CardDescription>Ajuste as variáveis fiscais para o ano de 2026.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-10 pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">{t('scenarios.irsLabel')}</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p className="max-w-xs">{t('scenarios.tooltips.irs')}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="secondary" className="text-lg font-mono px-3">{params.irs}%</Badge>
              </div>
              <Slider 
                value={[params.irs]} 
                onValueChange={([v]) => setParams(prev => ({ ...prev, irs: v }))} 
                min={10} max={45} step={0.5} 
              />
              <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                <span>Estimula Consumo</span>
                <span>Equilibra Contas</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">{t('scenarios.ivaLabel')}</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p className="max-w-xs">{t('scenarios.tooltips.iva')}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="secondary" className="text-lg font-mono px-3">{params.iva}%</Badge>
              </div>
              <Slider 
                value={[params.iva]} 
                onValueChange={([v]) => setParams(prev => ({ ...prev, iva: v }))} 
                min={15} max={28} step={0.5} 
              />
              <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                <span>Baixa Preços</span>
                <span>Aumenta Receita</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">{t('scenarios.investLabel')}</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger><Info className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p className="max-w-xs">{t('scenarios.tooltips.invest')}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="secondary" className="text-lg font-mono px-3">{params.investment}%</Badge>
              </div>
              <Slider 
                value={[params.investment]} 
                onValueChange={([v]) => setParams(prev => ({ ...prev, investment: v }))} 
                min={0.5} max={10} step={0.1} 
              />
              <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                <span>Contenção</span>
                <span>Expansão Estrutural</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Outputs Column --- */}
        <div className="space-y-6">
          <Card className="border-accent/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><Zap className="text-accent" /> {t('scenarios.outputs')}</CardTitle>
              <CardDescription>Impacto imediato projetado pelo motor económico.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              {/* GDP Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-bold">{t('scenarios.gdpLabel')}</span>
                  </div>
                  <span className={cn("text-2xl font-bold font-mono", results.gdp > 2.4 ? "text-green-600" : "text-amber-600")}>
                    {results.gdp}%
                  </span>
                </div>
                <Progress value={Math.min(100, (results.gdp + 5) * 10)} className="h-2" />
              </div>

              {/* Unemployment Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span className="font-bold">{t('scenarios.unemploymentLabel')}</span>
                  </div>
                  <span className={cn("text-2xl font-bold font-mono", results.unemployment < 6.1 ? "text-green-600" : "text-red-600")}>
                    {results.unemployment}%
                  </span>
                </div>
                <Progress value={results.unemployment * 5} className="h-2" />
              </div>

              {/* Inflation Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="font-bold">{t('scenarios.inflationLabel')}</span>
                  </div>
                  <span className={cn("text-2xl font-bold font-mono", Math.abs(results.inflation - 2) < 0.5 ? "text-green-600" : "text-amber-600")}>
                    {results.inflation}%
                  </span>
                </div>
                <Progress value={results.inflation * 10} className="h-2" />
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
                  <DialogHeader>
                    <DialogTitle>{t('scenarios.saveTitle')}</DialogTitle>
                    <DialogDescription>{t('scenarios.saveDesc')}</DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Título do Cenário</Label>
                      <Input value={scenarioTitle} onChange={(e) => setScenarioTitle(e.target.value)} placeholder="Ex: Portugal Digital 2026" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">{t('common.cancel')}</Button></DialogClose>
                    <Button onClick={handleSave} disabled={isSaving || !scenarioTitle.trim()}>{isSaving && <Loader2 className="mr-2 animate-spin h-4 w-4" />} {t('common.save')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleGetAnalysis} disabled={isAnalysing}>
                {isAnalysing ? <Loader2 className="mr-2 animate-spin h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4 text-accent fill-accent" />}
                Análise IA
              </Button>
            </CardFooter>
          </Card>

          {aiAnalysis && (
            <Card className="border-accent bg-accent/5 border-dashed">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" /> {t('scenarios.aiAnalysis')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AdBanner />

      {/* --- Community Scenarios --- */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" /> {t('scenarios.publicScenarios')}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publicScenarios?.map((s: any) => (
            <Card key={s.id} className="hover:shadow-lg transition-all cursor-pointer group border-primary/5" onClick={() => setParams(s.parameters)}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">{s.title}</CardTitle>
                  <Badge variant="outline" className="text-[8px] uppercase">Simulado</Badge>
                </div>
                <CardDescription className="text-[10px]">Por {s.userName || 'Cidadão'}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-[8px] uppercase font-bold opacity-50">PIB</p>
                    <p className="text-xs font-mono font-bold">{s.results.gdp}%</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-[8px] uppercase font-bold opacity-50">DES</p>
                    <p className="text-xs font-mono font-bold">{s.results.unemployment}%</p>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <p className="text-[8px] uppercase font-bold opacity-50">INF</p>
                    <p className="text-xs font-mono font-bold">{s.results.inflation}%</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t bg-muted/10 flex justify-center py-2">
                <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 group-hover:text-primary">
                  <Activity className="h-3 w-3" /> CARREGAR CENÁRIO
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
