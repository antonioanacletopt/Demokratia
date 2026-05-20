'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from '@/lib/i18n';
import { getIRSAssessment, type IRSAssessmentOutput } from '@/lib/actions';
import { 
  Calculator, UserCircle, PiggyBank, Sparkles, AlertTriangle,
  Loader2, Landmark, CheckCircle2, 
  HeartPulse, GraduationCap, Home, ShoppingBag, TrendingUp, TrendingDown,
  Scale, Briefcase, Receipt, Rocket, Banknote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdBanner } from '@/components/AdBanner';
import { InfoPopover } from '@/components/InfoPopover';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useUser, useDoc } from '@/firebase';
import { useEffect } from 'react';

export default function IRSPage() {
  const { t, language } = useTranslation();

  const { user } = useUser();

  // --- Budget Data Sync ---
  const { data: budgetConfig } = useDoc<any>('user_budgetConfig', user?.uid ?? null);

  // Personal Info
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married_Joint' | 'Married_Separate'>('Single');
  const [dependents, setDependents] = useState(0);

  // Income
  const [income, setIncome] = useState({
    categoryA: 25000,
    categoryB: 0,
    property: 0,
    capital: 0,
  });
  const [englobePropertyIncome, setEnglobePropertyIncome] = useState(false);
  const [englobeCapitalIncome, setEnglobeCapitalIncome] = useState(false);

  // Capital Gains (Category G)
  const [hasCapitalGains, setHasCapitalGains] = useState(false);
  const [capitalGains, setCapitalGains] = useState({
    realizationValue: 0,
    acquisitionValue: 0,
    expenses: 0,
    isPrimaryResidence: false,
    reinvestmentValue: 0,
  });

  // Special Regimes
  const [irsJovemYear, setIrsJovemYear] = useState<'Nenhum' | 'Ano 1' | 'Ano 2' | 'Ano 3' | 'Ano 4' | 'Ano 5'>('Nenhum');
  const [taxpayerDisability, setTaxpayerDisability] = useState(false);
  const [spouseDisability, setSpouseDisability] = useState(false);
  const [dependentsWithDisability, setDependentsWithDisability] = useState(0);

  // Expenses & Deductions
  const [expenses, setExpenses] = useState({
    health: 500,
    education: 200,
    housing: 1200,
    general: 2000,
    donations: 100,
    alimony: 0,
    unionFees: 60,
    vatOnInvoices: 150,
    careHomes: 0,
  });
  const [ppr, setPpr] = useState(0);
  const [retention, setRetention] = useState(3000);

  // Sync effect
  useEffect(() => {
    if (budgetConfig) {
      // Marital Status: If 2 adults, default to Jointly Married, else Single
      if (maritalStatus === 'Single' && budgetConfig.adults === 2) {
        setMaritalStatus('Married_Joint');
      }
      
      // Dependents
      if (dependents === 0 && budgetConfig.children > 0) {
        setDependents(budgetConfig.children);
      }

      // Income: Annualize (x14)
      if (income.categoryA === 25000 && budgetConfig.income) {
        setIncome(prev => ({ ...prev, categoryA: budgetConfig.income * 14 }));
      }

      // Expenses: Annualize (x12)
      if (budgetConfig.expenses) {
        setExpenses(prev => ({
          ...prev,
          housing: prev.housing === 1200 ? budgetConfig.expenses.housing * 12 : prev.housing,
          health: prev.health === 500 ? budgetConfig.expenses.health * 12 : prev.health,
          education: prev.education === 200 ? budgetConfig.expenses.education * 12 : prev.education,
        }));
      }
    }
  }, [budgetConfig]);

  // AI Result
  const [aiResult, setAiResult] = useState<IRSAssessmentOutput | null>(null);
  const [isAnalysing, startAnalysis] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = () => {
    setError(null);
    setAiResult(null);
    startAnalysis(async () => {
      try {
        const res = await getIRSAssessment({
          maritalStatus,
          dependents,
          income,
          capitalGains: hasCapitalGains ? capitalGains : undefined,
          englobePropertyIncome,
          englobeCapitalIncome,
          irsJovemYear,
          expenses,
          retention,
          disability: {
            taxpayer: taxpayerDisability,
            spouse: spouseDisability,
            dependents: dependentsWithDisability,
          },
          ppr,
        }, language);
        setAiResult(res);
      } catch (e: any) {
        if (e.message && e.message.includes('503')) {
          setError(t('common.aiUnavailableError'));
        } else {
          setError(t('common.genericError'));
        }
      }
    });
  };

  const isRefund = aiResult ? aiResult.refundOrPayment >= 0 : false;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-primary flex items-center gap-3"><Calculator className="h-10 w-10" /> {t('irs.title')}</h1>
            <p className="text-muted-foreground text-lg">{t('irs.description')}</p>
        </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal & Household Card */}
            <Card className="shadow-md"><CardHeader className="bg-muted/30 py-4"><CardTitle className="text-lg flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary" /> {t('irs.personalCard')}</CardTitle></CardHeader><CardContent className="pt-6 space-y-4"><div className="space-y-2"><div className="flex items-center"><Label>{t('irs.maritalStatus')}</Label><InfoPopover title={t('irs.maritalStatus')} content={t('irs.popovers.maritalStatus')} /></div><Select value={maritalStatus} onValueChange={(v: any) => setMaritalStatus(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Single">{t('irs.single')}</SelectItem><SelectItem value="Married_Joint">{t('irs.marriedJoint')}</SelectItem><SelectItem value="Married_Separate">{t('irs.marriedSeparate')}</SelectItem></SelectContent></Select></div><div className="space-y-2"><div className="flex items-center"><Label>{t('irs.dependents')}</Label><InfoPopover title={t('irs.dependents')} content={t('irs.popovers.dependents')} /></div><Input type="number" value={dependents} onChange={(e) => setDependents(Number(e.target.value))} min={0} max={10} /></div><Separator/><div className="space-y-2"><div className="flex items-center"><Label>{t('irs.incapacity')}</Label><InfoPopover title={t('irs.incapacity')} content={t('irs.popovers.incapacity')} /></div><div className="space-y-2 rounded-md border p-3"><div className="flex items-center justify-between"><Label htmlFor="taxpayer-disability" className="text-sm font-normal">{t('irs.taxpayer')}</Label><Switch id="taxpayer-disability" checked={taxpayerDisability} onCheckedChange={setTaxpayerDisability}/></div>{maritalStatus.startsWith('Married') && <div className="flex items-center justify-between"><Label htmlFor="spouse-disability" className="text-sm font-normal">{t('irs.spouse')}</Label><Switch id="spouse-disability" checked={spouseDisability} onCheckedChange={setSpouseDisability}/></div>}<div className="flex items-center justify-between"><Label htmlFor="dependents-disability" className="text-sm font-normal">{t('irs.dependents')}</Label><Input id="dependents-disability" type="number" value={dependentsWithDisability} onChange={(e) => setDependentsWithDisability(Number(e.target.value))} min={0} max={dependents} className="w-24 h-8"/></div></div></div></CardContent></Card>

            {/* Income Card */}
            <Card className="shadow-md border-primary/10"><CardHeader className="bg-primary/5 py-4"><CardTitle className="text-lg flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" /> {t('irs.incomeCard')}</CardTitle></CardHeader><CardContent className="pt-6 space-y-4"><div className="space-y-2"><Label>{t('irs.catA')}</Label><div className="relative"><span className="absolute right-3 top-2.5 text-muted-foreground text-sm">Γé¼</span><Input type="number" value={income.categoryA} onChange={(e) => setIncome(prev => ({ ...prev, categoryA: Number(e.target.value) }))} className="pr-8" /></div></div><div className="space-y-2"><Label>{t('irs.catB')}</Label><div className="relative"><span className="absolute right-3 top-2.5 text-muted-foreground text-sm">Γé¼</span><Input type="number" value={income.categoryB} onChange={(e) => setIncome(prev => ({ ...prev, categoryB: Number(e.target.value) }))} className="pr-8" /></div></div><div className="space-y-2"><Label>{t('irs.propertyInc')}</Label><div className="relative"><span className="absolute right-3 top-2.5 text-muted-foreground text-sm">Γé¼</span><Input type="number" value={income.property} onChange={(e) => setIncome(prev => ({ ...prev, property: Number(e.target.value) }))} className="pr-8" /></div><div className="flex items-center space-x-2 pt-1"><Switch id="englobe-property" checked={englobePropertyIncome} onCheckedChange={setEnglobePropertyIncome} /><Label htmlFor="englobe-property" className="text-sm font-normal">{t('irs.englobeProp')}</Label></div></div><div className="space-y-2"><Label>{t('irs.capitalInc')}</Label><div className="relative"><span className="absolute right-3 top-2.5 text-muted-foreground text-sm">Γé¼</span><Input type="number" value={income.capital} onChange={(e) => setIncome(prev => ({ ...prev, capital: Number(e.target.value) }))} className="pr-8" /></div><div className="flex items-center space-x-2 pt-1"><Switch id="englobe-capital" checked={englobeCapitalIncome} onCheckedChange={setEnglobeCapitalIncome} /><Label htmlFor="englobe-capital" className="text-sm font-normal">{t('irs.englobeCap')}</Label></div></div><Separator/><div className="space-y-2"><Label>{t('irs.retention')}</Label><div className="relative"><span className="absolute right-3 top-2.5 text-muted-foreground text-sm">Γé¼</span><Input type="number" value={retention} onChange={(e) => setRetention(Number(e.target.value))} className="pr-8 border-accent/20" /></div></div></CardContent></Card>
          </div>

          <Card className="shadow-md"><CardHeader className="bg-muted/30 py-4 flex flex-row items-center justify-between"><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" /> {t('irs.capitalGains.title')}</CardTitle><Switch checked={hasCapitalGains} onCheckedChange={setHasCapitalGains} /></CardHeader>{hasCapitalGains && (<CardContent className="pt-6 space-y-4 animate-in fade-in duration-300"><div className="space-y-2"><Label>{t('irs.capitalGains.realizationValue')}</Label><Input type="number" value={capitalGains.realizationValue} onChange={(e) => setCapitalGains(prev => ({ ...prev, realizationValue: Number(e.target.value) }))} /></div><div className="space-y-2"><Label>{t('irs.capitalGains.acquisitionValue')}</Label><Input type="number" value={capitalGains.acquisitionValue} onChange={(e) => setCapitalGains(prev => ({ ...prev, acquisitionValue: Number(e.target.value) }))} /></div><div className="space-y-2"><Label>{t('irs.capitalGains.expenses')}</Label><Input type="number" value={capitalGains.expenses} onChange={(e) => setCapitalGains(prev => ({ ...prev, expenses: Number(e.target.value) }))} /></div><Separator/><div className="flex items-center space-x-2 pt-1"><Switch id="is-primary" checked={capitalGains.isPrimaryResidence} onCheckedChange={(val) => setCapitalGains(prev => ({ ...prev, isPrimaryResidence: val }))} /><Label htmlFor="is-primary" className="text-sm font-normal">{t('irs.capitalGains.isPrimaryResidence')}</Label></div>{capitalGains.isPrimaryResidence && (<div className="space-y-2 pl-6 border-l-2 border-primary/20 animate-in fade-in duration-300"><Label>{t('irs.capitalGains.reinvestmentValue')}</Label><Input type="number" value={capitalGains.reinvestmentValue} onChange={(e) => setCapitalGains(prev => ({ ...prev, reinvestValue: Number(e.target.value) }))} /></div>)}</CardContent>)}</Card>

          <Card className="shadow-md"><CardHeader className="bg-muted/30 py-4"><CardTitle className="text-lg flex items-center gap-2"><Rocket className="h-5 w-5 text-accent" /> {t('irs.specialRegimes.title')}</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2 pt-6"><div className="space-y-2"><Label>{t('irs.specialRegimes.youth')}</Label><Select value={irsJovemYear} onValueChange={(v: any) => setIrsJovemYear(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Nenhum">{t('irs.specialRegimes.none')}</SelectItem><SelectItem value="Ano 1">{t('irs.specialRegimes.y1')}</SelectItem><SelectItem value="Ano 2">{t('irs.specialRegimes.y2')}</SelectItem><SelectItem value="Ano 3">{t('irs.specialRegimes.y3')}</SelectItem><SelectItem value="Ano 4">{t('irs.specialRegimes.y4')}</SelectItem><SelectItem value="Ano 5">{t('irs.specialRegimes.y5')}</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>{t('irs.specialRegimes.ppr')}</Label><div className="relative"><span className="absolute right-3 top-2.5 text-muted-foreground text-sm">Γé¼</span><Input type="number" value={ppr} onChange={(e) => setPpr(Number(e.target.value))} className="pr-8" /></div></div></CardContent></Card>

          <Card className="shadow-md"><CardHeader className="bg-muted/30 py-4"><CardTitle className="text-lg flex items-center gap-2"><PiggyBank className="h-5 w-5 text-green-600" /> {t('irs.expensesCard')}</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6"><div className="space-y-2"><Label className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-red-500" /> {t('irs.health')}</Label><Input type="number" value={expenses.health} onChange={(e) => setExpenses(prev => ({ ...prev, health: Number(e.target.value) }))} /></div><div className="space-y-2"><Label className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-blue-500" /> {t('irs.education')}</Label><Input type="number" value={expenses.education} onChange={(e) => setExpenses(prev => ({ ...prev, education: Number(e.target.value) }))} /></div><div className="space-y-2"><Label className="flex items-center gap-2"><Home className="h-4 w-4 text-amber-600" /> {t('irs.housing')}</Label><Input type="number" value={expenses.housing} onChange={(e) => setExpenses(prev => ({ ...prev, housing: Number(e.target.value) }))} /></div><div className="space-y-2"><Label className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-emerald-600" /> {t('irs.general')}</Label><Input type="number" value={expenses.general} onChange={(e) => setExpenses(prev => ({ ...prev, general: Number(e.target.value) }))} /></div><div className="space-y-2"><Label className="flex items-center gap-2"><Banknote className="h-4 w-4 text-cyan-600" /> {t('irs.careHomes')}</Label><Input type="number" value={expenses.careHomes} onChange={(e) => setExpenses(prev => ({ ...prev, careHomes: Number(e.target.value) }))} /></div><div className="space-y-2"><Label className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-pink-500" /> {t('irs.donations')}</Label><Input type="number" value={expenses.donations} onChange={(e) => setExpenses(prev => ({ ...prev, donations: Number(e.target.value) }))} /></div><div className="space-y-2"><Label className="flex items-center gap-2"><Scale className="h-4 w-4 text-stone-500" /> {t('irs.alimony')}</Label><Input type="number" value={expenses.alimony} onChange={(e) => setExpenses(prev => ({ ...prev, alimony: Number(e.target.value) }))} /></div><div className="space-y-2"><Label className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-teal-600" /> {t('irs.unionFees')}</Label><Input type="number" value={expenses.unionFees} onChange={(e) => setExpenses(prev => ({ ...prev, unionFees: Number(e.target.value) }))} /></div><div className="space-y-2"><Label className="flex items-center gap-2"><Receipt className="h-4 w-4 text-purple-600" /> {t('irs.vatInvoices')}</Label><Input type="number" value={expenses.vatOnInvoices} onChange={(e) => setExpenses(prev => ({ ...prev, vatOnInvoices: Number(e.target.value) }))} /></div></CardContent><CardFooter className="bg-muted/10 justify-end border-t p-4"><Button onClick={handleSimulate} disabled={isAnalysing} className="px-8 shadow-lg gap-2">{isAnalysing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}{t('irs.calculateBtn')}</Button></CardFooter></Card>
          
          <AdBanner />
        </div>

        {/* Result Column */}
        <div className="lg:col-span-4 space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isAnalysing && (
            <Card className="border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 text-center px-6">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">{t('irs.analyzing')}</p>
            </Card>
          )}

          {aiResult && !error && (
            <>
              <Card className={cn("border-2 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500", isRefund ? "border-green-500/30" : "border-red-500/30")}>
                <CardHeader className={cn("text-white", isRefund ? "bg-green-600" : "bg-red-600")}>
                  <CardTitle className="text-xl flex items-center gap-2">{isRefund ? <TrendingUp /> : <TrendingDown />} {t('irs.resultCard')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6"><div className="text-center space-y-1"><p className="text-xs uppercase font-bold text-muted-foreground">{isRefund ? t('irs.refund') : t('irs.payment')}</p><p className={cn("text-5xl font-bold font-headline tracking-tighter", isRefund ? "text-green-600" : "text-red-600")}>{Math.abs(aiResult.refundOrPayment).toLocaleString('pt-PT')}Γé¼</p></div><Separator /><div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground text-xs">{t('irs.estimatedTax')}</p><p className="font-bold">{aiResult.estimatedTax.toLocaleString('pt-PT')}Γé¼</p></div><div className="text-right"><p className="text-muted-foreground text-xs">{t('irs.effectiveRate')}</p><p className="font-bold">{aiResult.effectiveRate}%</p></div></div></CardContent>
              </Card>

              <Card className="border-accent border-dashed bg-accent/5"><CardHeader className="pb-2"><CardTitle className="text-xs uppercase tracking-widest text-accent flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> {t('irs.aiAnalysis')}</CardTitle></CardHeader><CardContent className="pt-2 space-y-4"><p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{aiResult.analysis}</p><div className="space-y-2 pt-2"><h4 className="text-xs font-bold uppercase text-accent">{t('irs.tipsTitle')}</h4><ul className="space-y-2">{aiResult.tips.map((tip: string, i: number) => (<li key={i} className="text-xs flex gap-2 items-start text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" /><span>{tip}</span></li>))}</ul></div></CardContent></Card>
            </>
          )}

          {!aiResult && !isAnalysing && !error && (
            <Card className="border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 text-center px-6">
              <Calculator className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">{t('irs.prompt')}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
