
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation, Language } from '@/lib/i18n';
import { getFamilyBudgetAnalysis, getTranslation } from '@/lib/server-actions';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, doc, setDoc, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { 
  Wallet, Users, Coins, ArrowDownCircle, Sparkles, 
  Loader2, Info, CheckCircle2, Languages, RefreshCw,
  Home, ShoppingCart, Zap, Car, HeartPulse, Palette,
  GraduationCap, Wifi, PiggyBank, ShieldCheck, MoreHorizontal,
  Calendar, ListPlus, TrendingUp, TrendingDown, AlertTriangle, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const MAX_CACHE_LENGTH = 1000;

const DEFAULT_COSTS_2026 = {
  housing: 750,
  food: 350,
  utilities: 150,
  transport: 120,
  health: 60,
  leisure: 100,
  education: 150,
  communications: 65,
  savings: 100,
  insurance: 120,
  other: 100
};

interface BudgetConfig {
  adults: number;
  children: number;
  income: number;
  expenses: typeof DEFAULT_COSTS_2026;
}

interface Movement {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'estimated' | 'real';
  date: any;
  createdAt: any;
}

export default function FamilyBudgetPage() {
  const { t, language: lang } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();

  // --- Configuration State ---
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [income, setIncome] = useState(1200);
  const [expenses, setExpenses] = useState(DEFAULT_COSTS_2026);

  // --- Movements State ---
  const [movTitle, setMovTitle] = useState('');
  const [movAmount, setMovAmount] = useState('');
  const [movType, setMovType] = useState<'income' | 'expense'>('expense');
  const [movStatus, setMovStatus] = useState<'estimated' | 'real'>('estimated');
  const [movDate, setMovDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [aiResult, setAiResult] = useState<{ analysis: string, tips: string[], score: number } | null>(null);
  const [isAnalysing, startAnalysis] = useTransition();

  const [isTranslating, startTransition] = useTransition();
  const [translatedAnalysis, setTranslatedAnalysis] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  // --- Firebase Loading ---
  const configRef = useMemoFirebase(() => user && firestore ? doc(firestore, 'users', user.uid, 'budget', 'config') : null, [user, firestore]);
  const { data: savedConfig } = useDoc<any>(configRef);

  const movementsQuery = useMemoFirebase(() => user && firestore ? query(collection(firestore, 'users', user.uid, 'movements'), orderBy('date', 'desc')) : null, [user, firestore]);
  const { data: movements } = useCollection<Movement>(movementsQuery);

  useEffect(() => {
    if (savedConfig) {
      setAdults(savedConfig.adults || 1);
      setChildren(savedConfig.children || 0);
      setIncome(savedConfig.income || 1200);
      setExpenses(savedConfig.expenses || DEFAULT_COSTS_2026);
    }
  }, [savedConfig]);

  const saveConfig = (newAdults: number, newChildren: number, newIncome: number, newExpenses: any) => {
    if (!user || !configRef) return;
    setDocumentNonBlocking(configRef, {
      adults: newAdults,
      children: newChildren,
      income: newIncome,
      expenses: newExpenses,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const handleAddMovement = () => {
    if (!user || !movTitle || !movAmount) return;
    const colRef = collection(firestore, 'users', user.uid, 'movements');
    addDocumentNonBlocking(colRef, {
      title: movTitle,
      amount: Number(movAmount),
      type: movType,
      status: movStatus,
      date: new Date(movDate),
      createdAt: serverTimestamp()
    });
    setMovTitle(''); setMovAmount('');
  };

  const handleToggleStatus = (mov: Movement) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'movements', mov.id);
    const newStatus = mov.status === 'estimated' ? 'real' : 'estimated';
    const updateData: any = { status: newStatus };
    if (newStatus === 'real') updateData.date = new Date(); // Adjust to today when real
    updateDoc(docRef, updateData);
  };

  const handleDeleteMovement = (id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'movements', id));
  };

  const overdueMovements = useMemo(() => {
    if (!movements) return [];
    const today = new Date();
    return movements.filter(m => m.status === 'estimated' && new Date(m.date?.toDate?.() || m.date) < today);
  }, [movements]);

  // --- Calculations ---
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary flex items-center gap-3">
          <Wallet className="h-10 w-10" /> {t('budget.title')}
        </h1>
        <p className="text-muted-foreground text-lg">{t('budget.description')}</p>
        
        {overdueMovements.length > 0 && (
          <AlertTriangle className="h-5 w-5 text-destructive inline-block animate-bounce" />
        )}
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="config" className="gap-2"><ListPlus className="h-4 w-4" /> {t('budget.tabs.config')}</TabsTrigger>
          <TabsTrigger value="movements" className="gap-2 relative">
            <Calendar className="h-4 w-4" /> {t('budget.tabs.movements')}
            {overdueMovements.length > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-8">
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
                      <Button variant={adults === 1 ? "default" : "outline"} onClick={() => { setAdults(1); saveConfig(1, children, income, expenses); }} className="w-full">1</Button>
                      <Button variant={adults === 2 ? "default" : "outline"} onClick={() => { setAdults(2); saveConfig(2, children, income, expenses); }} className="w-full">2</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('budget.children')}</Label>
                    <Slider value={[children]} onValueChange={([v]) => { setChildren(v); saveConfig(adults, v, income, expenses); }} min={0} max={5} step={1} />
                    <p className="text-xs text-center font-bold text-muted-foreground">{children}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('budget.income')}</Label>
                    <div className="relative">
                      <Coins className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="number" value={income} onChange={(e) => { const v = Number(e.target.value); setIncome(v); saveConfig(adults, children, v, expenses); }} className="pl-9" />
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
                      <Slider value={[expenses.housing]} onValueChange={([v]) => { const ne = { ...expenses, housing: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={200} max={2500} step={10} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><Label className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> {t('budget.food')}</Label><span>{expenses.food}€</span></div>
                      <Slider value={[expenses.food]} onValueChange={([v]) => { const ne = { ...expenses, food: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={100} max={1500} step={10} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><Label className="flex items-center gap-2"><Zap className="h-4 w-4" /> {t('budget.utilities')}</Label><span>{expenses.utilities}€</span></div>
                      <Slider value={[expenses.utilities]} onValueChange={([v]) => { const ne = { ...expenses, utilities: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={50} max={600} step={5} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><Label className="flex items-center gap-2"><Car className="h-4 w-4" /> {t('budget.transport')}</Label><span>{expenses.transport}€</span></div>
                      <Slider value={[expenses.transport]} onValueChange={([v]) => { const ne = { ...expenses, transport: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={0} max={1000} step={10} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><Label className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> {t('budget.health')}</Label><span>{expenses.health}€</span></div>
                      <Slider value={[expenses.health]} onValueChange={([v]) => { const ne = { ...expenses, health: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={0} max={500} step={5} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><Label className="flex items-center gap-2"><Palette className="h-4 w-4" /> {t('budget.leisure')}</Label><span>{expenses.leisure}€</span></div>
                      <Slider value={[expenses.leisure]} onValueChange={([v]) => { const ne = { ...expenses, leisure: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={0} max={1000} step={10} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between"><Label className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> {t('budget.education')}</Label><span>{expenses.education}€</span></div>
                      <Slider value={[expenses.education]} onValueChange={([v]) => { const ne = { ...expenses, education: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={0} max={1500} step={10} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><Label className="flex items-center gap-2"><Wifi className="h-4 w-4" /> {t('budget.communications')}</Label><span>{expenses.communications}€</span></div>
                      <Slider value={[expenses.communications]} onValueChange={([v]) => { const ne = { ...expenses, communications: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={20} max={300} step={1} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><Label className="flex items-center gap-2"><PiggyBank className="h-4 w-4" /> {t('budget.savings')}</Label><span>{expenses.savings}€</span></div>
                      <Slider value={[expenses.savings]} onValueChange={([v]) => { const ne = { ...expenses, savings: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={0} max={2000} step={10} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><Label className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {t('budget.insurance')}</Label><span>{expenses.insurance}€</span></div>
                      <Slider value={[expenses.insurance]} onValueChange={([v]) => { const ne = { ...expenses, insurance: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={0} max={1000} step={5} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><Label className="flex items-center gap-2"><MoreHorizontal className="h-4 w-4" /> {t('budget.other')}</Label><span>{expenses.other}€</span></div>
                      <Slider value={[expenses.other]} onValueChange={([v]) => { const ne = { ...expenses, other: v }; setExpenses(ne); saveConfig(adults, children, income, ne); }} min={0} max={1000} step={10} />
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
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{!showOriginal && translatedAnalysis ? translatedAnalysis : aiResult.analysis}</p>
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
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-1 shadow-md h-fit">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><ListPlus className="h-5 w-5 text-primary" /> {t('budget.movements.newTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? <p className="text-sm text-muted-foreground">{t('nav.login')}</p> : (
                  <>
                    <div className="space-y-2">
                      <Label>{t('budget.movements.titleLabel')}</Label>
                      <Input value={movTitle} onChange={(e) => setMovTitle(e.target.value)} placeholder="Ex: Renda Casa, Salário..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('budget.movements.amountLabel')}</Label>
                        <Input type="number" value={movAmount} onChange={(e) => setMovAmount(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('budget.movements.dateLabel')}</Label>
                        <Input type="date" value={movDate} onChange={(e) => setMovDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('budget.movements.typeLabel')}</Label>
                        <select className="w-full h-10 border rounded-md px-2" value={movType} onChange={(e: any) => setMovType(e.target.value)}>
                          <option value="expense">{t('budget.movements.expense')}</option>
                          <option value="income">{t('budget.movements.income')}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('budget.movements.statusLabel')}</Label>
                        <select className="w-full h-10 border rounded-md px-2" value={movStatus} onChange={(e: any) => setMovStatus(e.target.value)}>
                          <option value="estimated">{t('budget.movements.estimated')}</option>
                          <option value="real">{t('budget.movements.real')}</option>
                        </select>
                      </div>
                    </div>
                    <Button className="w-full mt-4" onClick={handleAddMovement} disabled={!movTitle || !movAmount}>
                      {t('budget.movements.addBtn')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {overdueMovements.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="text-sm font-bold">{t('budget.movements.overdueAlert')}</p>
                </div>
              )}

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{t('budget.tabs.movements')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!movements || movements.length === 0 ? (
                    <p className="text-center py-12 text-muted-foreground italic">{t('budget.movements.noMovements')}</p>
                  ) : (
                    <div className="space-y-3">
                      {movements.map((mov) => {
                        const isOverdue = mov.status === 'estimated' && new Date(mov.date?.toDate?.() || mov.date) < new Date();
                        const isIncome = mov.type === 'income';
                        return (
                          <div key={mov.id} className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all",
                            isOverdue ? "border-destructive/30 bg-destructive/5" : "bg-card"
                          )}>
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center",
                                isIncome ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                              )}>
                                {isIncome ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="font-bold">{mov.title}</p>
                                <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                                  {format(new Date(mov.date?.toDate?.() || mov.date), 'dd MMM yyyy', { locale: pt })}
                                  {mov.status === 'estimated' ? (
                                    <Badge variant="outline" className={cn("text-[8px] h-4", isOverdue && "border-destructive text-destructive")}>
                                      {isOverdue ? t('budget.movements.overdue') : t('budget.movements.estimated')}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[8px] h-4 text-green-600">
                                      <Check className="h-2 w-2 mr-1" /> {t('budget.movements.real')}
                                    </Badge>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={cn("font-bold text-lg", isIncome ? "text-green-600" : "text-red-600")}>
                                {isIncome ? '+' : '-'}{mov.amount}€
                              </span>
                              <div className="flex items-center gap-1">
                                {mov.status === 'estimated' && (
                                  <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(mov)} title={t('budget.movements.changeToReal')}>
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground hover:text-green-600" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteMovement(mov.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
