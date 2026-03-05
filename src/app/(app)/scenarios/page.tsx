
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, serverTimestamp, addDoc, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { getScenarioAnalysis, getTranslation } from '@/lib/server-actions';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, Info, Save, RefreshCcw, Share2, TrendingUp, Briefcase, Activity, 
  Landmark as GovBuilding, Sparkles, Loader2, Check, Target, PlusCircle, Scale, Wallet, Coins,
  HeartPulse, GraduationCap, Shield, Construction,
  Languages, RefreshCw
} from 'lucide-react';
import { AdBanner } from '@/components/AdBanner';
import { InfoPopover } from '@/components/InfoPopover';
import { cn } from '@/lib/utils';

const MAX_CACHE_LENGTH = 1000;

const REALITY_2026 = {
  irs: 25, 
  iva: 23, 
  irc: 21, 
  investment: 2.5, 
  smn: 870, 
  gdp: 2.4, 
  unemployment: 6.1, 
  inflation: 2.0, 
  debt: 88.5, 
  balance: 0.2 
};

const BUDGET_2026 = {
  health: 15.2,
  education: 9.8,
  social: 24.5,
  defense: 2.8,
  infra: 5.4,
  revenue: 72.5 
};

export default function ScenariosPage() {
  const { t, language } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [params, setParams] = useState({ 
    irs: REALITY_2026.irs, 
    iva: REALITY_2026.iva, 
    irc: REALITY_2026.irc,
    investment: REALITY_2026.investment,
    smn: REALITY_2026.smn
  });

  const [budget, setBudget] = useState({
    health: BUDGET_2026.health,
    education: BUDGET_2026.education,
    social: BUDGET_2026.social,
    defense: BUDGET_2026.defense,
    infra: BUDGET_2026.infra
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

  const [isTranslating, startTransition] = useTransition();
  const [translatedAnalysis, setTranslatedAnalysis] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  useEffect(() => {
    if (language === 'en' && aiAnalysis) {
      const checkCache = async () => {
        if (aiAnalysis.length > MAX_CACHE_LENGTH) return;
        const cacheRef = collection(firestore, 'translations_cache');
        const q = query(cacheRef, where('originalText', '==', aiAnalysis), where('targetLanguage', '==', 'English'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setTranslatedAnalysis(snap.docs[0].data().translatedText);
          setShowOriginal(false);
        }
      };
      checkCache();
    } else {
      setTranslatedAnalysis(null);
      setShowOriginal(true);
    }
  }, [language, aiAnalysis, firestore]);

  const handleTranslate = () => {
    if (!aiAnalysis) return;
    startTransition(async () => {
      const res = await getTranslation(aiAnalysis, language);
      setTranslatedAnalysis(res);
      setShowOriginal(false);
      
      if (aiAnalysis.length <= MAX_CACHE_LENGTH) {
        const cacheRef = collection(firestore, 'translations_cache');
        addDoc(cacheRef, { originalText: aiAnalysis, translatedText: res, targetLanguage: 'English', createdAt: serverTimestamp() });
      }
    });
  };

  const [isSuggestDialogOpen, setSuggestDialogOpen] = useState(false);
  const [suggestText, setSuggestText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    const dIrs = params.irs - REALITY_2026.irs;
    const dIva = params.iva - REALITY_2026.iva;
    const dIrc = params.irc - REALITY_2026.irc;
    const dInvest = params.investment - REALITY_2026.investment;
    const dSmn = (params.smn - REALITY_2026.smn) / 10; 

    const dHealth = budget.health - BUDGET_2026.health;
    const dEdu = budget.education - BUDGET_2026.education;
    const dSocial = budget.social - BUDGET_2026.social;
    const dDef = budget.defense - BUDGET_2026.defense;
    const dInfra = budget.infra - BUDGET_2026.infra;
    const totalBudgetDeviation = dHealth + dEdu + dSocial + dDef + dInfra;

    const budgetGdpImpact = (0.08 * dInfra) + (0.05 * dEdu) + (0.02 * dHealth);
    const fiscalGdpImpact = ((-0.1 * dIrs) + (-0.12 * dIva) + (-0.08 * dIrc) + (0.35 * dInvest) + (0.02 * dSmn));
    const newGdp = Math.max(-5, REALITY_2026.gdp + fiscalGdpImpact + budgetGdpImpact);

    const growthGap = newGdp - 2.0;
    const unempShift = (-0.35 * growthGap) + (0.01 * dSmn); 
    const newUnemp = Math.max(3, REALITY_2026.unemployment + unempShift);

    const inflShift = (0.2 * growthGap) + (0.25 * dIva) + (0.05 * dSmn);
    const newInfl = Math.max(-1, REALITY_2026.inflation + inflShift);

    const revenueImpact = (0.4 * dIrs) + (0.5 * dIva) + (0.2 * dIrc);
    const budgetBalanceImpact = -(totalBudgetDeviation / 265) * 100;
    const spendingImpact = (1.0 * dInvest) + (0.05 * dSmn);
    const newBalance = REALITY_2026.balance + revenueImpact - spendingImpact + budgetBalanceImpact;

    const debtShift = (-0.8 * growthGap) - (1.2 * newBalance);
    const newDebt = Math.max(50, REALITY_2026.debt + debtShift);

    setResults({
      gdp: parseFloat(newGdp.toFixed(2)),
      unemployment: parseFloat(newUnemp.toFixed(2)),
      inflation: parseFloat(newInfl.toFixed(2)),
      debt: parseFloat(newDebt.toFixed(2)),
      balance: parseFloat(newBalance.toFixed(2))
    });
  }, [params, budget]);

  const handleReset = () => {
    setParams({ 
      irs: REALITY_2026.irs, iva: REALITY_2026.iva, irc: REALITY_2026.irc, 
      investment: REALITY_2026.investment, smn: REALITY_2026.smn 
    });
    setBudget({
      health: BUDGET_2026.health, education: BUDGET_2026.education, 
      social: BUDGET_2026.social, defense: BUDGET_2026.defense, infra: BUDGET_2026.infra
    });
    setAiAnalysis(null);
    setTranslatedAnalysis(null);
  };

  const handleGetAnalysis = () => {
    startAnalysis(async () => {
      const res = await getScenarioAnalysis({ 
        parameters: { ...params, budget }, 
        results 
      }, language);
      setAiAnalysis(res?.feedback ?? null);
      setTranslatedAnalysis(null);
      setShowOriginal(true);
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
        parameters: { fiscal: params, budget: budget },
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
        subject: 'Sugestão de Indicador Macro/Orçamental',
        message: `Sugestão: ${suggestText}`,
        status: 'new',
        createdAt: serverTimestamp()
      });
      toast({ title: t('common.success'), description: 'Sugestão enviada.' });
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
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    toast({ title: t('common.linkCopied') });
    setTimeout(() => setCopied(false), 2000);
  };

  const totalSpend = useMemo(() => {
    return Object.values(budget).reduce((a, b) => a + b, 0);
  }, [budget]);

  const publicScenariosQuery = useMemoFirebase(() => query(collection(firestore, 'publicScenarios'), orderBy('createdAt', 'desc'), limit(6)), [firestore]);
  const { data: publicScenarios } = useCollection<any>(publicScenariosQuery);

  const displayAnalysis = !showOriginal && translatedAnalysis ? translatedAnalysis : aiAnalysis;

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
        <div className="space-y-6">
          <Tabs defaultValue="fiscal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fiscal" className="gap-2"><Scale className="h-4 w-4" /> {t('scenarios.tabs.fiscal')}</TabsTrigger>
              <TabsTrigger value="budget" className="gap-2"><GovBuilding className="h-4 w-4" /> {t('scenarios.tabs.budget')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fiscal">
              <Card className="border-primary/10 shadow-lg mt-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{t('scenarios.inputs')}</CardTitle>
                    <CardDescription>Ajuste as políticas fiscais básicas.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-1">
                        {t('scenarios.irsLabel')}
                        <InfoPopover title="IRS Progressivo" content="Imposto sobre o Rendimento de Pessoas Singulares. Alterar a taxa média simula uma mudança na carga fiscal sobre as famílias." link="https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs1.aspx" />
                      </Label>
                      <Badge variant="secondary" className="font-mono">{params.irs}%</Badge>
                    </div>
                    <Slider value={[params.irs]} onValueChange={([v]) => setParams(p => ({ ...p, irs: v }))} min={10} max={45} step={0.5} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-1">
                        {t('scenarios.ivaLabel')}
                        <InfoPopover title="IVA (Consumo)" content="Imposto sobre o Valor Acrescentado. Afeta diretamente os preços e a inflação (Art. 18.º CIVA)." link="https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/civa_rep/Pages/iva18.aspx" />
                      </Label>
                      <Badge variant="secondary" className="font-mono">{params.iva}%</Badge>
                    </div>
                    <Slider value={[params.iva]} onValueChange={([v]) => setParams(p => ({ ...p, iva: v }))} min={15} max={30} step={0.5} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-1">
                        {t('scenarios.ircLabel')}
                        <InfoPopover title="IRC (Empresas)" content="Imposto sobre o Rendimento das Pessoas Coletivas. Afeta a competitividade e a atração de investimento externo." />
                      </Label>
                      <Badge variant="secondary" className="font-mono">{params.irc}%</Badge>
                    </div>
                    <Slider value={[params.irc]} onValueChange={([v]) => setParams(p => ({ ...p, irc: v }))} min={10} max={30} step={0.5} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-1">
                        {t('scenarios.smnLabel')}
                        <InfoPopover title="Salário Mínimo" content="O SMN em 2026 reflete a trajetória de valorização acordada em concertação social." />
                      </Label>
                      <Badge variant="secondary" className="font-mono">{params.smn}€</Badge>
                    </div>
                    <Slider value={[params.smn]} onValueChange={([v]) => setParams(p => ({ ...p, smn: v }))} min={820} max={1200} step={5} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget">
              <Card className="border-primary/10 shadow-lg mt-4">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Gestão de Rubricas (B€)</CardTitle>
                      <CardDescription>Redistribua a despesa pública do OE2026.</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">{t('scenarios.budget.total')}</p>
                      <p className="text-xl font-bold text-primary">{totalSpend.toFixed(1)}B€</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2">
                        <HeartPulse className="h-4 w-4 text-red-500" /> {t('scenarios.budget.health')}
                        <InfoPopover title="Saúde (SNS)" content="Investimento no Serviço Nacional de Saúde. Afeta a qualidade do serviço e os tempos de espera." />
                      </Label>
                      <Badge variant={budget.health > BUDGET_2026.health ? "default" : "secondary"}>{budget.health.toFixed(1)}B€</Badge>
                    </div>
                    <Slider value={[budget.health]} onValueChange={([v]) => setBudget(b => ({ ...b, health: v }))} min={10} max={25} step={0.1} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-500" /> {t('scenarios.budget.education')}
                        <InfoPopover title="Educação e Ciência" content="Investimento em escolas, universidades e investigação. Tem impacto no PIB a longo prazo." />
                      </Label>
                      <Badge variant={budget.education > BUDGET_2026.education ? "default" : "secondary"}>{budget.education.toFixed(1)}B€</Badge>
                    </div>
                    <Slider value={[budget.education]} onValueChange={([v]) => setBudget(b => ({ ...b, education: v }))} min={5} max={15} step={0.1} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" /> {t('scenarios.budget.social')}
                        <InfoPopover title="Segurança Social" content="Pensões, subsídios e apoios sociais. É a maior rubrica da despesa pública." />
                      </Label>
                      <Badge variant={budget.social > BUDGET_2026.social ? "default" : "secondary"}>{budget.social.toFixed(1)}B€</Badge>
                    </div>
                    <Slider value={[budget.social]} onValueChange={([v]) => setBudget(b => ({ ...b, social: v }))} min={15} max={35} step={0.1} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="flex items-center gap-2">
                        <Construction className="h-4 w-4 text-amber-500" /> {t('scenarios.budget.infra')}
                        <InfoPopover title="Infraestruturas" content="Investimento em ferrovias, portos e energia. Essencial para a produtividade nacional." />
                      </Label>
                      <Badge variant={budget.infra > BUDGET_2026.infra ? "default" : "secondary"}>{budget.infra.toFixed(1)}B€</Badge>
                    </div>
                    <Slider value={[budget.infra]} onValueChange={([v]) => setBudget(b => ({ ...b, infra: v }))} min={2} max={12} step={0.1} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase font-bold border border-dashed" onClick={() => setSuggestDialogOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5 mr-1" /> {t('scenarios.suggestIndicator')}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="border-accent/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><Activity className="text-accent" /> {t('scenarios.outputs')}</CardTitle>
              <CardDescription>Painel de bordo da economia nacional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-primary" /> {t('scenarios.gdpLabel')}</span>
                  <span className={cn(results.gdp > 2.4 ? "text-green-600" : "text-amber-600")}>{results.gdp}%</span>
                </div>
                <Progress value={Math.min(100, (results.gdp + 5) * 10)} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-primary" /> {t('scenarios.unemploymentLabel')}</span>
                  <span className={cn(results.unemployment < 6.1 ? "text-green-600" : "text-red-600")}>{results.unemployment}%</span>
                </div>
                <Progress value={results.unemployment * 5} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-primary" /> {t('scenarios.debtLabel')}</span>
                  <span className={cn(results.debt < 88.5 ? "text-green-600" : "text-red-600")}>{results.debt}%</span>
                </div>
                <Progress value={results.debt - 50} className="h-1.5" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="flex items-center gap-1.5"><Coins className="h-3.5 w-3.5 text-primary" /> {t('scenarios.balanceLabel')}</span>
                  <span className={cn(results.balance >= 0 ? "text-green-600" : "text-red-600")}>{results.balance}%</span>
                </div>
                <Progress value={50 + results.balance * 10} className="h-1.5" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 py-4 flex justify-between items-center">
              <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="gap-2" disabled={!user}>
                    <Save className="h-4 w-4" /> {t('scenarios.saveTitle')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{t('scenarios.saveTitle')}</DialogTitle><DialogDescription>{t('scenarios.saveDesc')}</DialogDescription></DialogHeader>
                  <div className="py-4 space-y-2"><Label>Título do Cenário</Label><Input value={scenarioTitle} onChange={(e) => setScenarioTitle(e.target.value)} placeholder="Ex: Portugal OE2026 Alternativo" /></div>
                  <DialogFooter><DialogClose asChild><Button variant="ghost">{t('common.cancel')}</Button></DialogClose><Button onClick={handleSave} disabled={isSaving || !scenarioTitle.trim()}>{isSaving && <Loader2 className="mr-2 animate-spin h-4 w-4" />} {t('common.save')}</Button></DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleGetAnalysis} disabled={isAnalysing} className="border-accent/50 text-accent hover:bg-accent/10">
                {isAnalysing ? <Loader2 className="mr-2 animate-spin h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4 fill-accent" />}
                Parecer IA
              </Button>
            </CardFooter>
          </Card>

          {aiAnalysis && (
            <Card className="border-accent bg-accent/5 border-dashed overflow-hidden">
              <CardHeader className="pb-2 bg-accent/10 flex flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2 text-accent">
                  <Sparkles className="h-3.5 w-3.5" /> {t('scenarios.aiAnalysis')}
                </CardTitle>
                {language !== 'pt' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={translatedAnalysis ? () => setShowOriginal(!showOriginal) : handleTranslate} 
                    disabled={isTranslating} 
                    className="h-7 text-[9px] uppercase font-bold tracking-wider border-accent/50 text-accent hover:bg-accent/10 hover:text-accent"
                  >
                    {isTranslating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : translatedAnalysis ? <RefreshCw className="mr-1 h-3 w-3" /> : <Languages className="mr-1 h-3 w-3" />}
                    {isTranslating ? t('common.translating') : (translatedAnalysis ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate'))}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{displayAnalysis}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AdBanner />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" /> {t('scenarios.publicScenarios')}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publicScenarios?.map((s: any) => (
            <Card key={s.id} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => {
              if(s.parameters.fiscal) setParams(s.parameters.fiscal);
              if(s.parameters.budget) setBudget(s.parameters.budget);
              if(s.aiFeedback) setAiAnalysis(s.aiFeedback);
            }}>
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

      <Dialog open={isSuggestDialogOpen} onOpenChange={setSuggestDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('scenarios.suggestIndicator')}</DialogTitle><DialogDescription>{t('scenarios.suggestIndicatorDesc')}</DialogDescription></DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea placeholder="Ex: Gostaria de ver o impacto de alterar a verba da Cultura ou Ciência..." value={suggestText} onChange={(e) => setSuggestText(e.target.value)} rows={4} />
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
