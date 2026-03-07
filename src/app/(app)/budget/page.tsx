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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useTranslation, Language } from '@/lib/i18n';
import { getFamilyBudgetAnalysis } from '@/lib/server-actions';
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, serverTimestamp, doc, orderBy } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { 
  Wallet, Users, Coins, ArrowDownCircle, Sparkles, 
  Loader2, CheckCircle2, 
  Home, ShoppingCart, Zap, Car, HeartPulse, Palette,
  GraduationCap, Wifi, PiggyBank, ShieldCheck, MoreHorizontal,
  Calendar, ListPlus, TrendingUp, TrendingDown, AlertTriangle, Check, Trash2, Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Movement {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  status: 'estimated' | 'real';
  date: any;
  createdAt: any;
}

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

function LayeredProgressBar({ budget, real, estimated, className }: { budget: number, real: number, estimated: number, className?: string }) {
  const totalAccounted = real + estimated;
  const maxScale = Math.max(budget, totalAccounted, 1);
  
  const realPerc = (real / maxScale) * 100;
  const estimatedPerc = (estimated / maxScale) * 100;
  const budgetPerc = budget > totalAccounted ? ((budget - totalAccounted) / maxScale) * 100 : 0;

  return (
    <div className={cn("h-2 w-full bg-muted rounded-full overflow-hidden flex mt-2 shadow-inner", className)}>
      <div style={{ width: `${realPerc}%` }} className="bg-green-500 h-full transition-all duration-500" title="Realizado" />
      <div style={{ width: `${estimatedPerc}%` }} className="bg-orange-500 h-full transition-all duration-500" title="Previsto" />
      <div style={{ width: `${budgetPerc}%` }} className="bg-blue-500 h-full transition-all duration-500 opacity-40" title="Orçamentado" />
    </div>
  );
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
  const [movCategory, setMovCategory] = useState('housing');
  const [movType, setMovType] = useState<'income' | 'expense'>('expense');
  const [movStatus, setMovStatus] = useState<'estimated' | 'real'>('estimated');
  const [movDate, setMovDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // --- Editing State ---
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);

  const [aiResult, setAiResult] = useState<{ analysis: string, tips: string[] } | null>(null);
  const [isAnalysing, startAnalysis] = useTransition();

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
      userId: user.uid,
      title: movTitle,
      amount: Number(movAmount),
      category: movType === 'income' ? 'income' : (movCategory || 'other'),
      type: movType,
      status: movStatus,
      date: new Date(movDate),
      createdAt: serverTimestamp()
    });
    setMovTitle(''); setMovAmount('');
  };

  const handleUpdateMovement = () => {
    if (!user || !editingMovement) return;
    const docRef = doc(firestore, 'users', user.uid, 'movements', editingMovement.id);
    updateDocumentNonBlocking(docRef, {
      title: movTitle,
      amount: Number(movAmount),
      category: movType === 'income' ? 'income' : (movCategory || editingMovement.category || 'other'),
      type: movType,
      status: movStatus,
      date: new Date(movDate),
      updatedAt: serverTimestamp()
    });
    setEditingMovement(null);
    setMovTitle(''); setMovAmount('');
  };

  const handleEditClick = (mov: Movement) => {
    setEditingMovement(mov);
    setMovTitle(mov.title || '');
    setMovAmount(mov.amount?.toString() || '0');
    setMovCategory(mov.category || 'other');
    setMovType(mov.type || 'expense');
    setMovStatus(mov.status || 'estimated');
    const dateObj = mov.date?.toDate?.() || mov.date || new Date();
    setMovDate(format(new Date(dateObj), 'yyyy-MM-dd'));
  };

  const handleToggleStatus = (mov: Movement) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'movements', mov.id);
    const newStatus = mov.status === 'estimated' ? 'real' : 'estimated';
    const updateData: any = { 
      status: newStatus,
      updatedAt: serverTimestamp()
    };
    if (newStatus === 'real') updateData.date = new Date();
    updateDocumentNonBlocking(docRef, updateData);
  };

  const handleDeleteMovement = (id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'movements', id));
  };

  const getCategoryTotals = (catKey: string) => {
    if (!movements) return { real: 0, estimated: 0 };
    const filtered = movements.filter(m => m.type === 'expense' && m.category === catKey);
    return {
      real: filtered.filter(m => m.status === 'real').reduce((acc, curr) => acc + curr.amount, 0),
      estimated: filtered.filter(m => m.status === 'estimated').reduce((acc, curr) => acc + curr.amount, 0)
    };
  };

  const overdueMovements = useMemo(() => {
    if (!movements) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return movements.filter(m => m.status === 'estimated' && new Date(m.date?.toDate?.() || m.date) < today);
  }, [movements]);

  const totalBudgeted = useMemo(() => Object.values(expenses).reduce((a, b) => a + b, 0), [expenses]);
  
  const executionTotals = useMemo(() => {
    if (!movements) return { real: 0, estimated: 0 };
    const expenseMovs = movements.filter(m => m.type === 'expense');
    return {
      real: expenseMovs.filter(m => m.status === 'real').reduce((acc, curr) => acc + curr.amount, 0),
      estimated: expenseMovs.filter(m => m.status === 'estimated').reduce((acc, curr) => acc + curr.amount, 0)
    };
  }, [movements]);

  const balance = income - executionTotals.real - executionTotals.estimated;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  const handleGetAnalysis = () => {
    startAnalysis(async () => {
      const res = await getFamilyBudgetAnalysis({
        budget: {
          profile: { adults, children, totalNetIncome: income },
          expenses
        }
      }, lang as Language);
      setAiResult({ analysis: res.analysis, tips: res.suggestions });
    });
  };

  const categories = [
    { key: 'housing', icon: Home, label: t('budget.housing'), min: 200, max: 2500 },
    { key: 'food', icon: ShoppingCart, label: t('budget.food'), min: 100, max: 1500 },
    { key: 'utilities', icon: Zap, label: t('budget.utilities'), min: 50, max: 600 },
    { key: 'transport', icon: Car, label: t('budget.transport'), min: 0, max: 1000 },
    { key: 'health', icon: HeartPulse, label: t('budget.health'), min: 0, max: 500 },
    { key: 'leisure', icon: Palette, label: t('budget.leisure'), min: 0, max: 1000 },
    { key: 'education', icon: GraduationCap, label: t('budget.education'), min: 0, max: 1500 },
    { key: 'communications', icon: Wifi, label: t('budget.communications'), min: 20, max: 300 },
    { key: 'savings', icon: PiggyBank, label: t('budget.savings'), min: 0, max: 2000 },
    { key: 'insurance', icon: ShieldCheck, label: t('budget.insurance'), min: 0, max: 1000 },
    { key: 'other', icon: MoreHorizontal, label: t('budget.other'), min: 0, max: 1000 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary flex items-center gap-3">
          <Wallet className="h-10 w-10" /> {t('budget.title')}
        </h1>
        <p className="text-muted-foreground text-lg">{t('budget.description')}</p>
        
        {overdueMovements.length > 0 && (
          <div className="flex items-center gap-2 text-destructive font-bold animate-pulse bg-destructive/5 p-2 rounded-lg border border-destructive/20 w-fit">
            <AlertTriangle className="h-5 w-5" />
            <span>{t('budget.movements.overdueAlert')}</span>
          </div>
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
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-green-500" /> <span className="text-[10px] uppercase font-bold">Real</span></div>
                    <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-orange-500" /> <span className="text-[10px] uppercase font-bold">Previsto</span></div>
                    <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" /> <span className="text-[10px] uppercase font-bold">Orçamento</span></div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-x-12 gap-y-8 sm:grid-cols-2 pt-6">
                  {categories.map((cat) => {
                    const totals = getCategoryTotals(cat.key);
                    return (
                      <div key={cat.key} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <Label className="flex items-center gap-2 font-bold"><cat.icon className="h-4 w-4 text-primary" /> {cat.label}</Label>
                          <div className="text-right">
                            <span className="text-xs font-bold">{totals.real + totals.estimated}€</span>
                            <span className="text-[10px] text-muted-foreground ml-1">/ {expenses[cat.key]}€</span>
                          </div>
                        </div>
                        <LayeredProgressBar budget={expenses[cat.key]} real={totals.real} estimated={totals.estimated} />
                        <Slider 
                          value={[expenses[cat.key]]} 
                          onValueChange={([v]) => { 
                            const ne = { ...expenses, [cat.key]: v }; 
                            setExpenses(ne); 
                            saveConfig(adults, children, income, ne); 
                          }} 
                          min={cat.min} 
                          max={cat.max} 
                          step={5} 
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-primary/20 shadow-lg overflow-hidden h-fit sticky top-20">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="text-xl flex items-center gap-2"><CheckCircle2 className="h-6 w-6" /> {t('budget.summaryTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{t('budget.totalIncome')}</span>
                      <span className="font-bold text-green-600">{income}€</span>
                    </div>
                    <Separator className="opacity-50" />
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 opacity-50" />
                        <span className="text-muted-foreground">Orçamentado</span>
                      </div>
                      <span className="font-bold text-blue-600">{totalBudgeted}€</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Executado (Real)</span>
                      </div>
                      <span className="font-bold text-green-600">{executionTotals.real}€</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        <span className="text-muted-foreground">Previsto</span>
                      </div>
                      <span className="font-bold text-orange-500">{executionTotals.estimated}€</span>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Execução vs. Orçamento</p>
                      <LayeredProgressBar budget={totalBudgeted} real={executionTotals.real} estimated={executionTotals.estimated} className="h-3" />
                    </div>
                  </div>

                  <Separator />
                  <div className="text-center py-4">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t('budget.balance')}</p>
                    <p className={cn("text-4xl font-bold font-headline", balance >= 0 ? "text-primary" : "text-destructive")}>{balance.toFixed(0)}€</p>
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
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-widest text-accent flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5" /> {t('budget.aiAnalysis')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiResult.analysis}</p>
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
                    
                    {movType === 'expense' && (
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <select className="w-full h-10 border rounded-md px-2 bg-background text-sm" value={movCategory} onChange={(e) => setMovCategory(e.target.value)}>
                          {categories.map(c => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

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
                        <select className="w-full h-10 border rounded-md px-2 bg-background text-sm" value={movType} onChange={(e: any) => setMovType(e.target.value)}>
                          <option value="expense">{t('budget.movements.expense')}</option>
                          <option value="income">{t('budget.movements.income')}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('budget.movements.statusLabel')}</Label>
                        <select className="w-full h-10 border rounded-md px-2 bg-background text-sm" value={movStatus} onChange={(e: any) => setMovStatus(e.target.value)}>
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
                        const cat = categories.find(c => c.key === mov.category);
                        
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
                                <div className="font-bold">{mov.title}</div>
                                <div className="flex items-center gap-2">
                                  {cat && <Badge variant="secondary" className="text-[8px] h-4 uppercase">{cat.label}</Badge>}
                                  <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
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
                                  </div>
                                </div>
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
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(mov)}>
                                  <Edit className="h-4 w-4 text-muted-foreground" />
                                </Button>
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

      <Dialog open={!!editingMovement} onOpenChange={(o) => !o && setEditingMovement(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('budget.movements.editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('budget.movements.titleLabel')}</Label>
              <Input value={movTitle} onChange={(e) => setMovTitle(e.target.value)} />
            </div>
            
            {movType === 'expense' && (
              <div className="space-y-2">
                <Label>Categoria</Label>
                <select className="w-full h-10 border rounded-md px-2 bg-background text-sm" value={movCategory} onChange={(e) => setMovCategory(e.target.value)}>
                  {categories.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}

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
                <select className="w-full h-10 border rounded-md px-2 bg-background text-sm" value={movType} onChange={(e: any) => setMovType(e.target.value)}>
                  <option value="expense">{t('budget.movements.expense')}</option>
                  <option value="income">{t('budget.movements.income')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t('budget.movements.statusLabel')}</Label>
                <select className="w-full h-10 border rounded-md px-2 bg-background text-sm" value={movStatus} onChange={(e: any) => setMovStatus(e.target.value)}>
                  <option value="estimated">{t('budget.movements.estimated')}</option>
                  <option value="real">{t('budget.movements.real')}</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleUpdateMovement}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
