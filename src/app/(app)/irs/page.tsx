'use client';

import { useState, useTransition, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTranslation } from '@/lib/i18n';
import { getIRSAssessment } from '@/lib/actions';
import { 
  Calculator, UserCircle, Users, PiggyBank, Sparkles, 
  Loader2, Info, CheckCircle2, Landmark, Wallet,
  HeartPulse, GraduationCap, Home, ShoppingBag, TrendingUp, TrendingDown,
  ExternalLink, BookOpen, FileText, Gavel
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdBanner } from '@/components/AdBanner';
import Link from 'next/link';

function InfoButton({ title, content, link }: { title: string, content: string, link?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1.5 rounded-full text-muted-foreground hover:text-primary">
          <Info className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 shadow-xl border-primary/20">
        <div className="space-y-2">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {content}
          </p>
          {link && (
            <Link 
              href={link} 
              target="_blank" 
              className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline pt-1"
            >
              Consultar no DRE/CIRS <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function IRSPage() {
  const { t, language } = useTranslation();

  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married_Joint' | 'Married_Separate'>('Single');
  const [dependents, setDependents] = useState(0);
  const [income, setIncome] = useState(25000);
  const [retention, setRetention] = useState(3000);

  const [expenses, setExpenses] = useState({
    health: 500,
    education: 200,
    housing: 1200,
    general: 2000,
  });

  const [aiResult, setAiResult] = useState<any>(null);
  const [isAnalysing, startAnalysis] = useTransition();

  const handleSimulate = () => {
    startAnalysis(async () => {
      const res = await getIRSAssessment({
        maritalStatus,
        dependents,
        grossAnnualIncome: income,
        expenses,
        retention,
      }, language);
      setAiResult(res);
    });
  };

  const isRefund = aiResult?.refundOrPayment >= 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary flex items-center gap-3">
          <Calculator className="h-10 w-10" /> {t('irs.title')}
        </h1>
        <p className="text-muted-foreground text-lg">{t('irs.description')}</p>
        <div className="bg-muted/30 p-4 rounded-xl border border-muted flex gap-3 items-start mt-2">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">{t('irs.howItWorks')}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader className="bg-muted/30 py-4">
                <CardTitle className="text-lg flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary" /> {t('irs.personalCard')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>{t('irs.maritalStatus')}</Label>
                    <InfoButton 
                      title="Quociente Familiar" 
                      content="O estado civil define como o rendimento é dividido para aplicação das taxas. Casados podem optar por tributação conjunta (Art. 69.º CIRS)."
                      link="https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1988-34509075-48313"
                    />
                  </div>
                  <Select value={maritalStatus} onValueChange={(v: any) => setMaritalStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">{t('irs.single')}</SelectItem>
                      <SelectItem value="Married_Joint">{t('irs.marriedJoint')}</SelectItem>
                      <SelectItem value="Married_Separate">{t('irs.marriedSeparate')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>{t('irs.dependents')}</Label>
                    <InfoButton 
                      title="Dedução por Dependente" 
                      content="Cada dependente confere uma dedução fixa à coleta (Art. 78.º-A do CIRS), que varia consoante a idade e o número de dependentes."
                    />
                  </div>
                  <Input type="number" value={dependents} onChange={(e) => setDependents(Number(e.target.value))} min={0} max={10} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-primary/10">
              <CardHeader className="bg-primary/5 py-4">
                <CardTitle className="text-lg flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" /> {t('irs.incomeCard')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>{t('irs.grossIncome')}</Label>
                    <InfoButton 
                      title="Rendimentos Categoria A" 
                      content="Valor total bruto anual recebido (salários, subsídios). Base para a determinação do escalão (Art. 2.º do CIRS)."
                      link="https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1988-34509075-48313"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">€</span>
                    <Input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="pr-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label>{t('irs.retention')}</Label>
                    <InfoButton 
                      title="Retenção na Fonte" 
                      content="Imposto já pago mensalmente através do empregador. Este valor é abatido ao imposto final apurado."
                      link="https://www.portaldasfinancas.gov.pt/at/html/index.html"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">€</span>
                    <Input type="number" value={retention} onChange={(e) => setRetention(Number(e.target.value))} className="pr-8 border-accent/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md">
            <CardHeader className="bg-muted/30 py-4">
              <CardTitle className="text-lg flex items-center gap-2"><PiggyBank className="h-5 w-5 text-green-600" /> {t('irs.expensesCard')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-red-500" /> {t('irs.health')}</Label>
                  <InfoButton 
                    title="Despesas de Saúde" 
                    content="Dedução de 15% das despesas de saúde, com limite de €1.000 (Art. 78.º-C do CIRS)."
                    link="https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1988-34509075-48313"
                  />
                </div>
                <Input type="number" value={expenses.health} onChange={(e) => setExpenses(prev => ({ ...prev, health: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-blue-500" /> {t('irs.education')}</Label>
                  <InfoButton 
                    title="Educação e Formação" 
                    content="Dedução de 30% das despesas de educação, até ao limite de €800 (Art. 78.º-D do CIRS)."
                  />
                </div>
                <Input type="number" value={expenses.education} onChange={(e) => setExpenses(prev => ({ ...prev, education: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><Home className="h-4 w-4 text-amber-600" /> {t('irs.housing')}</Label>
                  <InfoButton 
                    title="Habitação" 
                    content="Dedução de juros de crédito (contratos até 2011) ou 15% das rendas pagas até €502 (Art. 78.º-E do CIRS)."
                  />
                </div>
                <Input type="number" value={expenses.housing} onChange={(e) => setExpenses(prev => ({ ...prev, housing: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-emerald-600" /> {t('irs.general')}</Label>
                  <InfoButton 
                    title="Despesas Gerais Familiares" 
                    content="35% das despesas com fatura, com limite de €250 por sujeito passivo (Art. 78.º-B do CIRS)."
                  />
                </div>
                <Input type="number" value={expenses.general} onChange={(e) => setExpenses(prev => ({ ...prev, general: Number(e.target.value) }))} />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 justify-end border-t p-4">
              <Button onClick={handleSimulate} disabled={isAnalysing} className="px-8 shadow-lg gap-2">
                {isAnalysing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                {t('irs.calculateBtn')}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-dashed bg-muted/5">
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <Gavel className="h-4 w-4" /> Fontes e Legislação de Referência
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-xs">
              <Link href="https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1988-34509075" target="_blank" className="flex items-center gap-2 p-3 border rounded-lg bg-card hover:border-primary transition-colors group">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-bold group-hover:text-primary">Código do IRS (CIRS)</p>
                  <p className="text-muted-foreground">Legislação consolidada 2026.</p>
                </div>
              </Link>
              <Link href="https://www.portugal.gov.pt/pt/gc24/governo/orcamento-do-estado" target="_blank" className="flex items-center gap-2 p-3 border rounded-lg bg-card hover:border-primary transition-colors group">
                <Landmark className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-bold group-hover:text-primary">Orçamento de Estado 2026</p>
                  <p className="text-muted-foreground">Relatório e Propostas de Lei.</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <AdBanner />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {aiResult ? (
            <>
              <Card className={cn("border-2 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500", isRefund ? "border-green-500/30" : "border-red-500/30")}>
                <CardHeader className={cn("text-white", isRefund ? "bg-green-600" : "bg-red-600")}>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {isRefund ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                    {t('irs.resultCard')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center space-y-1">
                    <p className="text-xs uppercase font-bold text-muted-foreground">{isRefund ? t('irs.refund') : t('irs.payment')}</p>
                    <p className={cn("text-5xl font-bold font-headline tracking-tighter", isRefund ? "text-green-600" : "text-red-600")}>
                      {Math.abs(aiResult.refundOrPayment).toLocaleString('pt-PT')}€
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">{t('irs.estimatedTax')}</p>
                      <p className="font-bold">{aiResult.estimatedTax.toLocaleString('pt-PT')}€</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">{t('irs.effectiveRate')}</p>
                      <p className="font-bold">{aiResult.effectiveRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent border-dashed bg-accent/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-accent flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" /> {t('irs.aiAnalysis')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {aiResult.analysis}
                  </p>
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase text-accent">{t('irs.tipsTitle')}</h4>
                    <ul className="space-y-2">
                      {aiResult.tips.map((tip: string, i: number) => (
                        <li key={i} className="text-xs flex gap-2 items-start text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 text-center px-6">
              <Calculator className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">{t('irs.calculateBtn')} para ver a projeção fiscal.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
