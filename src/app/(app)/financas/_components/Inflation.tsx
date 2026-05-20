'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingDown, TrendingUp, Info, ShoppingCart, BarChart3, Wallet, RefreshCw, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { BASELINE_DATA, OTHER_INDICATORS, type CpiCategory, type InflationData } from '@/lib/inflation-data';
import { getInflationData } from '@/lib/actions';
import { useUser, useDoc } from '@/firebase';
import Link from 'next/link';

// ΓöÇΓöÇΓöÇ Budget category ΓåÆ weight mapping
const BUDGET_CATEGORY_MAP: Record<string, string> = {
  food: 'CP01',
  housing: 'CP04',
  health: 'CP06',
  transport: 'CP07',
  communications: 'CP08',
  leisure: 'CP09',
  education: 'CP10',
  other: 'CP12',
};

function calcPersonalInflation(categories: CpiCategory[], weights: Record<string, number>): number {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return categories.reduce((sum, cat) => {
    const w = (weights[cat.coicop] ?? 0) / total;
    return sum + cat.rate * w;
  }, 0);
}

function RateBar({ rate, max = 6 }: { rate: number; max?: number }) {
  const positive = rate >= 0;
  const pct = Math.min(Math.abs(rate) / max * 100, 100);
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', positive ? 'bg-red-500' : 'bg-green-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('text-xs font-semibold tabular-nums w-12 text-right', positive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400')}>
        {positive ? '+' : ''}{rate.toFixed(1)}%
      </span>
    </div>
  );
}

export default function InflationPage() {
  const { user } = useUser();

  const [data, setData] = useState<InflationData>(BASELINE_DATA);
  const [loading, setLoading] = useState(true);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  const [budgetLoaded, setBudgetLoaded] = useState(false);

  // Load live inflation data
  useEffect(() => {
    getInflationData().then(d => { setData(d); setLoading(false); });
  }, []);

  // Initialise weights from INE basket
  useEffect(() => {
    if (Object.keys(weights).length === 0) {
      const initial: Record<string, number> = {};
      BASELINE_DATA.categories.forEach(c => { initial[c.coicop] = c.weight; });
      setWeights(initial);
    }
  }, []);

  // Always call useDoc — pass null when user is not logged in (hook accepts null)
  const budgetDoc = useDoc('user_budgetConfig', user?.uid ?? null);

  useEffect(() => {
    if (!budgetLoaded && budgetDoc?.data) {
      const budget = budgetDoc.data as any;
      const totalBudget = Object.values(BUDGET_CATEGORY_MAP).reduce((_, key) => {
        return _ + (budget[Object.keys(BUDGET_CATEGORY_MAP).find(k => BUDGET_CATEGORY_MAP[k] === key) ?? ''] ?? 0);
      }, 0);

      if (totalBudget > 0) {
        const newWeights = { ...weights };
        Object.entries(BUDGET_CATEGORY_MAP).forEach(([budgetKey, coicop]) => {
          const val = budget[budgetKey];
          if (typeof val === 'number' && val > 0) {
            newWeights[coicop] = val;
          }
        });
        setWeights(newWeights);
        setBudgetLoaded(true);
      }
    }
  }, [budgetDoc?.data]);

  const personalRate = useMemo(() => calcPersonalInflation(data.categories, weights), [data.categories, weights]);
  const officialRate = data.overall;
  const diff = personalRate - officialRate;
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  // Monthly cost impact estimate (using average PT household spend ~2200Γé¼/month)
  const avgMonthly = 2200;
  const monthlyImpact = (personalRate / 100) * avgMonthly;

  return (
    <TooltipProvider>
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/20">
              <ShoppingCart className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">A Tua Infla├º├úo Real</h1>
              <p className="text-muted-foreground text-sm">
                O governo diz {officialRate}%. A tua carteira pode sentir outra coisa.
              </p>
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              A carregar dados em tempo real do Eurostat...
            </div>
          )}
          {!loading && data.isLive && (
            <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Γ£ô Dados em tempo real ΓÇö {data.periodLabel} ΓÇö {data.source}
            </Badge>
          )}
          {!loading && !data.isLive && (
            <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
              Dados de refer├¬ncia ΓÇö {data.periodLabel}
            </Badge>
          )}
        </div>

        {/* Hero numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Infla├º├úo oficial</p>
              <p className="text-4xl font-black text-red-600 dark:text-red-400">{officialRate.toFixed(1)}<span className="text-xl">%</span></p>
              <p className="text-xs text-muted-foreground mt-1">Cabaz m├⌐dio INE (IHPC)</p>
            </CardContent>
          </Card>
          <Card className={cn('border-2', diff > 0.5 ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-900/10' : 'border-green-400 bg-green-50/50 dark:bg-green-900/10')}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">A tua infla├º├úo real</p>
              <p className={cn('text-4xl font-black', diff > 0.5 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400')}>
                {personalRate.toFixed(1)}<span className="text-xl">%</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {diff > 0.5 ? `+${diff.toFixed(1)}% acima da m├⌐dia` : diff < -0.5 ? `${diff.toFixed(1)}% abaixo da m├⌐dia` : 'Pr├│xima da m├⌐dia nacional'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Impacto mensal estimado</p>
              <p className="text-4xl font-black text-foreground">
                +{monthlyImpact.toFixed(0)}<span className="text-xl">Γé¼</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Sobre despesa mensal m├⌐dia (2.200Γé¼)</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              Infla├º├úo por categoria
            </CardTitle>
            <CardDescription>
              O cabaz oficial esconde varia├º├╡es enormes entre categorias. Ajusta os pesos abaixo para ver a tua infla├º├úo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm">
                <Wallet className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-blue-700 dark:text-blue-300">
                  Tens o or├ºamento preenchido?{' '}
                  <Link href="/login" className="font-semibold underline">Inicia sess├úo</Link>
                  {' '}para importar os teus pesos automaticamente.
                </span>
              </div>
            )}
            {budgetLoaded && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm">
                <Wallet className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-green-700 dark:text-green-300">
                  Pesos importados automaticamente do teu or├ºamento.
                </span>
              </div>
            )}

            <div className="space-y-5">
              {data.categories.map(cat => {
                const w = weights[cat.coicop] ?? cat.weight;
                const pctOfTotal = totalWeight > 0 ? (w / totalWeight) * 100 : 0;
                return (
                  <div key={cat.coicop} className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-x-4 gap-y-1 items-start">
                    <div className="flex items-center gap-2 min-w-[180px]">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <p className="text-sm font-medium leading-none">{cat.labelPt}</p>
                        <p className="text-xs text-muted-foreground">{pctOfTotal.toFixed(1)}% do teu cabaz</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <RateBar rate={cat.rate} />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-8">{w.toFixed(0)}%</span>
                        <Slider
                          value={[w]}
                          min={0}
                          max={40}
                          step={0.5}
                          onValueChange={([v]) => setWeights(prev => ({ ...prev, [cat.coicop]: v }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                            {cat.coicop}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Classifica├º├úo INE/Eurostat</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const reset: Record<string, number> = {};
                  BASELINE_DATA.categories.forEach(c => { reset[c.coicop] = c.weight; });
                  setWeights(reset);
                  setBudgetLoaded(false);
                }}
              >
                Repor cabaz INE
              </Button>
              <p className="text-xs text-muted-foreground">
                Fonte: <a href="https://ec.europa.eu/eurostat/web/hicp" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Eurostat IHPC</a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What the number hides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              O que o n├║mero oficial esconde
            </CardTitle>
            <CardDescription>
              Existe uma diferen├ºa entre os indicadores macro e o seu impacto real no cidad├úo comum.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {OTHER_INDICATORS.map(ind => (
              <Collapsible
                key={ind.id}
                open={expandedIndicator === ind.id}
                onOpenChange={open => setExpandedIndicator(open ? ind.id : null)}
              >
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors text-left">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ind.icon}</span>
                        <div>
                          <p className="font-semibold text-sm">{ind.labelPt}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Oficial:{' '}
                              <span className="font-semibold text-foreground">
                                {ind.official}{ind.unit}
                              </span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Real:{' '}
                              <span className="font-semibold" style={{ color: ind.color }}>
                                {ind.real}{ind.unit}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:flex h-2 w-20 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(ind.official / (ind.real || 1)) * 100}%`, backgroundColor: ind.color, opacity: 0.4 }} />
                          <div className="h-full rounded-full" style={{ width: `${((ind.real - ind.official) / (ind.real || 1)) * 100}%`, backgroundColor: ind.color }} />
                        </div>
                        {expandedIndicator === ind.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-2 rounded-b-xl border border-t-0 -mt-1 bg-muted/20 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border bg-card text-center">
                        <p className="text-xs text-muted-foreground mb-1">{ind.officialLabel}</p>
                        <p className="text-2xl font-black text-muted-foreground">{ind.official}{ind.unit}</p>
                      </div>
                      <div className="p-3 rounded-lg border-2 bg-card text-center" style={{ borderColor: ind.color + '60' }}>
                        <p className="text-xs text-muted-foreground mb-1">{ind.realLabel}</p>
                        <p className="text-2xl font-black" style={{ color: ind.color }}>{ind.real}{ind.unit}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{ind.explanation}</p>
                    <p className="text-xs text-muted-foreground/60">Fonte: {ind.source}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>

        {/* CTA to budget */}
        <Card className="border-dashed bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
          <CardContent className="pt-6 pb-6 text-center space-y-3">
            <Wallet className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-lg">V├¬ como a infla├º├úo come o teu or├ºamento</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Preenche o teu or├ºamento pessoal e esta p├ígina calcula automaticamente a infla├º├úo real do teu perfil de consumo.
            </p>
            <Button asChild className="mt-2">
              <Link href="/budget">
                <Wallet className="h-4 w-4 mr-2" />
                Preencher or├ºamento
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Methodology note */}
        <p className="text-xs text-muted-foreground text-center pb-4">
          Dados: Eurostat IHPC (s├⌐rie prc_hicp_manr, Portugal) ┬╖ INE ┬╖ Banco de Portugal.<br />
          Os valores "reais" s├úo estimativas baseadas em fontes alternativas e n├úo substituem os dados oficiais. <a href="/methodology" className="underline hover:text-primary">Metodologia</a>
        </p>

      </div>
    </TooltipProvider>
  );
}
