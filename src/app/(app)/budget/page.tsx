
'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation, Language } from '@/lib/i18n';
import { getFamilyBudgetAnalysis, getTranslation } from '@/lib/server-actions';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Wallet, Users, Coins, ArrowDownCircle, Sparkles, 
  Loader2, Info, CheckCircle2, Languages, RefreshCw,
  Home, ShoppingCart, Zap, Car, HeartPulse, Palette,
  GraduationCap, Ticket, Wifi, PiggyBank, ShieldCheck, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_CACHE_LENGTH = 1000;

const DEFAULT_COSTS_2026 = {
  housing: 750,
  food: 350,
  utilities: 150,
  transport: 120,
  health: 60,
  leisure: 100,
  education: 150,
  entertainment: 80,
  communications: 65,
  savings: 100,
  insurance: 120,
  other: 100
};

export default function FamilyBudgetPage() {
  const { t, language: lang } = useTranslation();
  const firestore = useFirestore();

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [income, setIncome] = useState(1200);

  const [expenses, setExpenses] = useState({
    housing: DEFAULT_COSTS_2026.housing,
    food: DEFAULT_COSTS_2026.food,
    utilities: DEFAULT_COSTS_2026.utilities,
    transport: DEFAULT_COSTS_2026.transport,
    health: DEFAULT_COSTS_2026.health,
    leisure: DEFAULT_COSTS_2026.leisure,
    education: DEFAULT_COSTS_2026.education,
    entertainment: DEFAULT_COSTS_2026.entertainment,
    communications: DEFAULT_COSTS_2026.communications,
    savings: DEFAULT_COSTS_2026.savings,
    insurance: DEFAULT_COSTS_2026.insurance,
    other: DEFAULT_COSTS_2026.other
  });

  const [aiResult, setAiResult] = useState<{ analysis: string, tips: string[], score: number } | null>(null);
  const [isAnalysing, startAnalysis] = useTransition();

  const [isTranslating, startTransition] = useTransition();
  const [translatedAnalysis, setTranslatedAnalysis] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  useEffect(() => {
    if (lang === 'en' && aiResult?.analysis) {
      const checkCache = async () => {
        if (aiResult.analysis.length > MAX_CACHE_LENGTH) return;
        const cacheRef = collection(firestore, 'translations_cache');
        const q = query(cacheRef, where('originalText', '==', aiResult.analysis), where('targetLanguage', '==', 'English'), limit(1));
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
  }, [lang, aiResult, firestore]);

  const handleTranslate = () => {
    if (!aiResult?.analysis) return;
    startTransition(async () => {
      const res = await getTranslation(aiResult.analysis, lang as Language);
      setTranslatedAnalysis(res);
      setShowOriginal(false);
      const cacheRef = collection(firestore, 'translations_cache');
      addDoc(cacheRef, { originalText: aiResult.analysis, translatedText: res, targetLanguage: 'English', createdAt: serverTimestamp() });
    });
  };

  useEffect(() => {
    const multiplier = adults + (children * 0.5);
    const childMultiplier = children > 0 ? children : 0;
    
    setExpenses(prev => ({
      ...prev,
      food: Math.round(DEFAULT_COSTS_2026.food * multiplier),
      utilities: Math.round(DEFAULT_COSTS_2026.utilities * (1 + (adults-1)*0.3 + (children*0.15))),
      health: Math.round(DEFAULT_COSTS_2026.health * multiplier),
      education: Math.round(DEFAULT_COSTS_2026.education * (children > 0 ? children : 0.2)),
    }));
  }, [adults, children]);

  const totalExpenses = useMemo(() => Object.values(expenses).reduce((a, b) => a + b, 0), [expenses]);
  const balance = income - totalExpenses;
  const savingsRate = (balance / income) * 100;

  const handleGetAnalysis = () => {
    startAnalysis(async () => {
      const res = await getFamilyBudgetAnalysis({
        budget: {
          profile: { adults, children, totalNetIncome: income },
          expenses
        }
      }, lang as Language);
      setAiResult({ analysis: res.analysis, tips: res.suggestions, score: 0 });
      setTranslatedAnalysis(null);
      setShowOriginal(true);
    });
  };

  const displayAnalysis = !showOriginal && translatedAnalysis ? translatedAnalysis : aiResult?.analysis;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary flex items-center gap-3">
          <Wallet className="h-10 w-10" /> {t('budget.title')}
        </h1>
        <p className="text-muted-foreground text-lg">{t('budget.description')}</p>
        <div className="bg-muted/30 p-4 rounded-xl border border-muted flex gap-3 items-start mt-2">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">{t('budget.howItWorks')}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> {t('budget.profileTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-3 pt-6">
              <div className="space-y-2">
                <Label>{t('budget.adults')}</Label>
                <div className="flex items-center gap-4">
                  <Button variant={adults === 1 ? "default" : "outline"} onClick={() => setAdults(1)} className="w-full">1</Button>
                  <Button variant={adults === 2 ? "default" : "outline"} onClick={() => setAdults(2)} className="w-full">2</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('budget.children')}</Label>
                <Slider value={[children]} onValueChange={([v]) => setChildren(v)} min={0} max={5} step={1} />
                <p className="text-xs text-center font-bold text-muted-foreground">{children}</p>
              </div>
              <div className="space-y-2">
                <Label>{t('budget.income')}</Label>
                <div className="relative">
                  <Coins className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="pl-9" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2"><ArrowDownCircle className="h-5 w-5 text-red-500" /> {t('budget.expensesTitle')}</CardTitle>
              <CardDescription>{t('budget.defaultsInfo')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 sm:grid-cols-2 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><Home className="h-4 w-4" /> {t('budget.housing')}</Label><span>{expenses.housing}€</span></div>
                  <Slider value={[expenses.housing]} onValueChange={([v]) => setExpenses(e => ({ ...e, housing: v }))} min={200} max={2500} step={10} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> {t('budget.food')}</Label><span>{expenses.food}€</span></div>
                  <Slider value={[expenses.food]} onValueChange={([v]) => setExpenses(e => ({ ...e, food: v }))} min={100} max={1500} step={10} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><Zap className="h-4 w-4" /> {t('budget.utilities')}</Label><span>{expenses.utilities}€</span></div>
                  <Slider value={[expenses.utilities]} onValueChange={([v]) => setExpenses(e => ({ ...e, utilities: v }))} min={50} max={600} step={5} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><Car className="h-4 w-4" /> {t('budget.transport')}</Label><span>{expenses.transport}€</span></div>
                  <Slider value={[expenses.transport]} onValueChange={([v]) => setExpenses(e => ({ ...e, transport: v }))} min={0} max={1000} step={10} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> {t('budget.health')}</Label><span>{expenses.health}€</span></div>
                  <Slider value={[expenses.health]} onValueChange={([v]) => setExpenses(e => ({ ...e, health: v }))} min={0} max={500} step={5} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><Palette className="h-4 w-4" /> {t('budget.leisure')}</Label><span>{expenses.leisure}€</span></div>
                  <Slider value={[expenses.leisure]} onValueChange={([v]) => setExpenses(e => ({ ...e, leisure: v }))} min={0} max={1000} step={10} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> {t('budget.education')}</Label><span>{expenses.education}€</span></div>
                  <Slider value={[expenses.education]} onValueChange={([v]) => setExpenses(e => ({ ...e, education: v }))} min={0} max={1500} step={10} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><Ticket className="h-4 w-4" /> {t('budget.entertainment')}</Label><span>{expenses.entertainment}€</span></div>
                  <Slider value={[expenses.entertainment]} onValueChange={([v]) => setExpenses(e => ({ ...e, entertainment: v }))} min={0} max={800} step={5} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><Wifi className="h-4 w-4" /> {t('budget.communications')}</Label><span>{expenses.communications}€</span></div>
                  <Slider value={[expenses.communications]} onValueChange={([v]) => setExpenses(e => ({ ...e, communications: v }))} min={20} max={300} step={1} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><PiggyBank className="h-4 w-4" /> {t('budget.savings')}</Label><span>{expenses.savings}€</span></div>
                  <Slider value={[expenses.savings]} onValueChange={([v]) => setExpenses(e => ({ ...e, savings: v }))} min={0} max={2000} step={10} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {t('budget.insurance')}</Label><span>{expenses.insurance}€</span></div>
                  <Slider value={[expenses.insurance]} onValueChange={([v]) => setExpenses(e => ({ ...e, insurance: v }))} min={0} max={1000} step={5} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label className="flex items-center gap-2"><MoreHorizontal className="h-4 w-4" /> {t('budget.other')}</Label><span>{expenses.other}€</span></div>
                  <Slider value={[expenses.other]} onValueChange={([v]) => setExpenses(e => ({ ...e, other: v }))} min={0} max={1000} step={10} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20 shadow-lg overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-xl flex items-center gap-2"><CheckCircle2 className="h-6 w-6" /> {t('budget.summaryTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('budget.totalIncome')}</span>
                <span className="font-bold text-green-600">{income}€</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('budget.totalExpenses')}</span>
                <span className="font-bold text-red-500">{totalExpenses}€</span>
              </div>
              <Separator />
              <div className="text-center py-4">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t('budget.balance')}</p>
                <p className={cn("text-4xl font-bold font-headline", balance >= 0 ? "text-primary" : "text-destructive")}>{balance}€</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>{t('budget.savingsRate')}</span>
                  <span>{savingsRate.toFixed(1)}%</span>
                </div>
                <Progress value={Math.max(0, savingsRate)} className={cn("h-2", savingsRate < 10 ? "bg-red-100" : "bg-green-100")} />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-4">
              <Button className="w-full gap-2" onClick={handleGetAnalysis} disabled={isAnalysing}>
                {isAnalysing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 fill-current" />}
                {t('budget.getAnalysisBtn')}
              </Button>
            </CardFooter>
          </Card>

          {aiResult && (
            <Card className="border-accent bg-accent/5 border-dashed">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-widest text-accent flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" /> {t('budget.aiAnalysis')}
                </CardTitle>
                {lang !== 'pt' && (
                  <Button variant="outline" size="sm" onClick={translatedAnalysis ? () => setShowOriginal(!showOriginal) : handleTranslate} disabled={isTranslating} className="h-7 text-[9px] border-accent/50 text-accent font-bold">
                    {isTranslating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    {translatedAnalysis ? (showOriginal ? t('common.translate') : t('common.showOriginal')) : t('common.translate')}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayAnalysis}</p>
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase text-accent mb-2">{t('budget.aiTips')}</h4>
                  <ul className="space-y-2">
                    {aiResult.tips.map((tip, i) => (
                      <li key={i} className="text-xs flex gap-2 items-start">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
