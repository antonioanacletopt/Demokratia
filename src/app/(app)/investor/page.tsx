'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n';
import { getMarketAnalysis, type MarketAnalysisOutput, Language } from '@/lib/actions';
import { 
  TrendingUp, TrendingDown, Info, ShieldCheck, Coins, Sparkles, 
  Loader2, Calculator, Briefcase, Activity, Landmark, 
  ArrowRight, HeartPulse, Construction, Zap, Flame, ShieldAlert,
  Ship, Plane, Cpu, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

export default function InvestorPage() {
  const { t, language } = useTranslation();
  const [analysis, setAnalysis] = useState<MarketAnalysisOutput | null>(null);
  const [isAnalysing, startAnalysis] = useTransition();

  // PPR States
  const [pprAmount, setPprAmount] = useState(2000);
  const [pprRisk, setPprRisk] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [pprResult, setPprResult] = useState<{ benefit: number, projected: number } | null>(null);

  useEffect(() => {
    startAnalysis(async () => {
      const res = await getMarketAnalysis(language as Language);
      setAnalysis(res);
    });
  }, [language]);

  const handlePprSimulation = () => {
    // Basic calculation for Portuguese tax benefits (IRS Article 21 EBF)
    // 20% deduction, max varies by age (we'll use 400€ max as general MVP)
    const benefit = Math.min(pprAmount * 0.2, 400);
    const rates = { conservative: 0.02, moderate: 0.05, aggressive: 0.08 };
    const rate = rates[pprRisk];
    const projected = pprAmount * Math.pow(1 + rate, 20);
    setPprResult({ benefit, projected });
  };

  const chartData = analysis?.assets.map(a => ({
    name: a.name,
    value: a.currentValue,
    trend: a.trend
  })) || [];

  const chartConfig: ChartConfig = {
    value: { label: 'Value', color: 'hsl(var(--primary))' }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary flex items-center gap-3">
          <TrendingUp className="h-10 w-10" /> {t('investor.title')}
        </h1>
        <p className="text-muted-foreground text-lg">{t('investor.description')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Analysis Column */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-primary/10 shadow-lg overflow-hidden">
            <CardHeader className="bg-primary/5">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  {t('investor.strategicAnalysis')}
                </CardTitle>
                {analysis && <Badge variant="secondary" className={cn("gap-1", analysis.sentiment === 'Bullish' ? "text-green-600" : "text-red-600")}>
                  {analysis.sentiment === 'Bullish' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {analysis.sentiment}
                </Badge>}
              </div>
              <CardDescription>Gerado por IA a partir de tendências globais 2026</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isAnalysing ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Sintetizando notícias do mercado...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-8">
                  <div className="bg-muted/30 p-4 rounded-xl border italic text-sm leading-relaxed">
                    "{analysis.globalContext}"
                  </div>
                  
                  <div className="grid gap-6">
                    {analysis.sectors.map((sector, i) => (
                      <div key={i} className="space-y-2 group">
                        <div className="flex items-center gap-2 font-bold text-primary">
                          {i === 0 && <Flame className="h-4 w-4 text-orange-500" />}
                          {i === 1 && <ShieldAlert className="h-4 w-4 text-blue-500" />}
                          {i === 2 && <Coins className="h-4 w-4 text-amber-500" />}
                          {i === 3 && <Ship className="h-4 w-4 text-slate-500" />}
                          {sector.name}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4 pl-6 border-l-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                          <div className="text-xs">
                            <span className="font-bold uppercase text-[9px] text-muted-foreground block mb-1">Contexto</span>
                            {sector.context}
                          </div>
                          <div className="text-xs bg-accent/5 p-2 rounded border border-accent/10">
                            <span className="font-bold uppercase text-[9px] text-accent block mb-1">Oportunidade</span>
                            {sector.opportunity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* PPR Section */}
          <Card className="border-accent/20 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" /> {t('investor.pprTitle')}
                </CardTitle>
                <CardDescription>{t('investor.pprDesc')}</CardDescription>
              </div>
              <Landmark className="h-8 w-8 text-muted-foreground/20" />
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('investor.investmentAmount')}</Label>
                  <Input 
                    type="number" 
                    value={pprAmount} 
                    onChange={(e) => setPprAmount(Number(e.target.value))} 
                    className="text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('investor.riskLevel')}</Label>
                  <Tabs value={pprRisk} onValueChange={(v: any) => setPprRisk(v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="conservative">{t('investor.conservative')}</TabsTrigger>
                      <TabsTrigger value="moderate">{t('investor.moderate')}</TabsTrigger>
                      <TabsTrigger value="aggressive">{t('investor.aggressive')}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <Button onClick={handlePprSimulation} className="w-full gap-2">
                  <Zap className="h-4 w-4 fill-current" /> {t('investor.invest')}
                </Button>
              </div>

              {pprResult && (
                <div className="bg-muted/20 rounded-2xl p-6 border-2 border-dashed flex flex-col justify-center gap-6 animate-in fade-in slide-in-from-right-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{t('investor.fiscalBenefit')}</p>
                    <p className="text-4xl font-bold font-headline text-green-600">{pprResult.benefit}€</p>
                    <p className="text-[9px] text-muted-foreground mt-1">Dedução direta no IRS (Art. 21.º EBF)</p>
                  </div>
                  <Separator />
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{t('investor.projectedValue')}</p>
                    <p className="text-2xl font-bold text-primary">{Math.round(pprResult.projected).toLocaleString('pt-PT')}€</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                {t('investor.marketSnapshot')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                {analysis && (
                  <ChartContainer config={chartConfig} className="h-full">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                )}
              </div>
              <div className="mt-4 grid gap-2">
                {analysis?.assets.map((asset, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-muted/30">
                    <span className="font-medium">{asset.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{asset.currentValue.toLocaleString()}</span>
                      <Badge variant="outline" className={cn("text-[8px] h-4", asset.trend.includes('+') ? "text-green-600 border-green-200" : "text-red-600 border-red-200")}>
                        {asset.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-accent" />
                Dica do Consultor 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              Com as novas taxas de retenção de 2026, otimizar o seu PPR no início do ano pode garantir um reembolso de IRS superior. Ativos de "refúgio" como o Ouro continuam a ser fundamentais num cenário de conflitos globais prolongados.
            </CardContent>
            <CardFooter>
              <Button variant="link" size="sm" className="p-0 text-xs text-accent font-bold" asChild>
                <a href="https://www.bportugal.pt/servicos-ao-cidadao" target="_blank">Portal do Cliente Bancário <ArrowRight className="ml-1 h-3 w-3" /></a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
