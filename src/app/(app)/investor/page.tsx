'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { useTranslation, type Language } from '@/lib/i18n';
import { getMarketAnalysis } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import StockMarketTicker from "@/components/StockMarketTicker";
import CommoditiesWatch from "@/components/CommoditiesWatch";
import { FinancialNewsFeed } from "@/components/FinancialNewsFeed";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, TrendingDown, Info, Sparkles, 
  LineChart, HelpCircle, Loader2, AlertTriangle 
} from 'lucide-react';

// Tipos para os valores do formulário
type RiskProfile = 'conservative' | 'moderate' | 'aggressive';
type TimeHorizon = 'short' | 'medium' | 'long';
type Outlook = 'Bullish' | 'Bearish' | 'Neutral';

function ConfidenceMeter({ value, className }: { value: number, className?: string }) {
  const { t } = useTranslation();
  const percentage = value * 100;
  let bgColor = 'bg-gray-400';
  let labelKey: 'high' | 'medium' | 'low' | 'neutral' = 'neutral';

  if (percentage >= 75) {
    bgColor = 'bg-green-500';
    labelKey = 'high';
  } else if (percentage >= 50) {
    bgColor = 'bg-yellow-500';
    labelKey = 'medium';
  } else {
    bgColor = 'bg-red-500';
    labelKey = 'low';
  }

  const label = t(`investor.confidenceLabels.${labelKey}`);
  const confidenceMeterText = t('investor.confidenceMeter')
    .replace('{{percentage}}', percentage.toFixed(0))
    .replace('{{label}}', label);

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <div className={cn("h-2 w-2 rounded-full", bgColor)} />
      <span className="font-medium">{confidenceMeterText}</span>
    </div>
  );
}

function OutlookIndicator({ value, className }: { value: Outlook, className?: string }) {
  const { t } = useTranslation();
  const Icon = value === 'Bullish' ? TrendingUp : value === 'Bearish' ? TrendingDown : HelpCircle;
  const color = value === 'Bullish' ? 'text-green-500' : value === 'Bearish' ? 'text-red-500' : 'text-gray-500';
  
  let label;
  if (value === 'Bullish') {
    label = t('investor.outlookLabels.bullish');
  } else if (value === 'Bearish') {
    label = t('investor.outlookLabels.bearish');
  } else {
    label = t('investor.outlookLabels.neutral');
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className, color)}>
      <Icon className="h-5 w-5" />
      <span className="font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

// Funções auxiliares para traduções seguras para tipos
const getTimeHorizonLabel = (t: (key: any) => string, timeHorizon: TimeHorizon) => {
  const key = `investor.timeHorizons.${timeHorizon}`;
  return t(key);
};

const getRiskProfileLabel = (t: (key: any) => string, riskProfile: RiskProfile) => {
  const key = `investor.riskProfiles.${riskProfile}`;
  return t(key);
};

function InvestorPageContents() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [asset, setAsset] = useState('');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon | ''>('');
  const [riskProfile, setRiskProfile] = useState<RiskProfile | ''>('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !timeHorizon || !riskProfile) {
      toast({ variant: "destructive", title: t('common.error'), description: t('investor.error.allFieldsRequired') });
      return;
    }
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await getMarketAnalysis({ asset, timeHorizon, riskProfile }, language);
      setAnalysis(result);
    } catch (error) {
      toast({ variant: "destructive", title: t('common.error'), description: t('common.aiUnavailableError') });
    }
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      {/* Coluna da Esquerda (Controles) */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">{t('investor.title')}</h1>
          <p className="text-muted-foreground text-lg">{t('investor.description')}</p>
        </div>

        <Card className="sticky top-24 shadow-lg border-primary/20">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{t('investor.strategicAnalysis')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="asset" className="flex items-center gap-1.5"><LineChart className="h-4 w-4 text-accent"/>{t('investor.assetLabel')}</Label>
                <Input id="asset" placeholder={t('investor.assetPlaceholder')} value={asset} onChange={(e) => setAsset(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-horizon">{t('investor.timeHorizonLabel')}</Label>
                <Select onValueChange={(v) => setTimeHorizon(v as TimeHorizon)} value={timeHorizon}>
                  <SelectTrigger id="time-horizon"><SelectValue placeholder={t('investor.selectTimeHorizon')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">{t('investor.timeHorizons.short')}</SelectItem>
                    <SelectItem value="medium">{t('investor.timeHorizons.medium')}</SelectItem>
                    <SelectItem value="long">{t('investor.timeHorizons.long')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk-profile">{t('investor.riskProfileLabel')}</Label>
                <Select onValueChange={(v) => setRiskProfile(v as RiskProfile)} value={riskProfile}>
                  <SelectTrigger id="risk-profile"><SelectValue placeholder={t('investor.selectRiskProfile')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">{t('investor.riskProfiles.conservative')}</SelectItem>
                    <SelectItem value="moderate">{t('investor.riskProfiles.moderate')}</SelectItem>
                    <SelectItem value="aggressive">{t('investor.riskProfiles.aggressive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{t('investor.analyzeBtn')}</Button>
            </CardFooter>
          </form>
        </Card>

        <StockMarketTicker />
      </div>

      {/* Coluna da Direita (Resultados) */}
      <div className="lg:col-span-2 space-y-6">
        {isLoading && (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        )}

        {!isLoading && !analysis && (
          <div className="flex flex-col items-center justify-center text-center h-[60vh] bg-muted/30 rounded-xl border border-dashed">
            <Sparkles className="h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mt-4">{t('investor.waiting.title')}</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">{t('investor.waiting.description')}</p>
          </div>
        )}

        {analysis && (
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardDescription>{t('investor.analysisFor').replace('{{asset}}', analysis.asset)}</CardDescription>
                  <CardTitle className="text-2xl">{analysis.analysisTitle}</CardTitle>
                </div>
                <OutlookIndicator value={analysis.outlook} />
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                {t('investor.analysisMeta')
                  .replace('{{timeHorizon}}', getTimeHorizonLabel(t, analysis.timeHorizon as TimeHorizon))
                  .replace('{{riskProfile}}', getRiskProfileLabel(t, analysis.riskProfile as RiskProfile))
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ConfidenceMeter value={analysis.confidenceScore} />

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="lead">{analysis.summary}</p>
                
                <h3 className="flex items-center gap-2"><TrendingUp className="text-green-500" />{t('investor.keyFactors')}</h3>
                <ul>
                  {analysis.keyFactors.map((factor: string, i: number) => <li key={i}>{factor}</li>)}
                </ul>

                <h3 className="flex items-center gap-2"><AlertTriangle className="text-yellow-500"/>{t('investor.potentialRisks')}</h3>
                <ul>
                  {analysis.potentialRisks.map((risk: string, i: number) => <li key={i}>{risk}</li>)}
                </ul>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <h3 className="font-bold text-primary flex items-center gap-2"><Info className="h-4 w-4"/>{t('investor.suggestedAction')}</h3>
                <p className="text-sm mt-2">{analysis.suggestedAction}</p>
              </div>

            </CardContent>
             <CardFooter className="bg-muted/20 py-2 border-t">
                <p className="text-xs text-muted-foreground italic">{analysis.disclaimer}</p>
            </CardFooter>
          </Card>
        )}

        {!isLoading && 
          <div className="space-y-6 pt-6">
             <CommoditiesWatch />
             <FinancialNewsFeed />
          </div>
        }
      </div>
    </div>
  );
}

export default function InvestorPage() {
  return (
    <Suspense fallback={<p>A carregar...</p>}>
      <InvestorPageContents />
    </Suspense>
  )
}