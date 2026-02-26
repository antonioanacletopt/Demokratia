
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Map as MapIcon, TrendingUp, Users, Home, AlertCircle, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type IndicatorKey = 'salary' | 'poverty' | 'population' | 'housing';

interface RegionData {
  id: string;
  name: string;
  salary: number;
  poverty: number;
  population: number;
  housing: number;
}

const PORTUGAL_DATA_2026: RegionData[] = [
  { id: 'norte', name: 'Norte', salary: 1450, poverty: 18.5, population: 165, housing: 1850 },
  { id: 'centro', name: 'Centro', salary: 1380, poverty: 17.2, population: 78, housing: 1450 },
  { id: 'lisboa', name: 'Área Metropol. Lisboa', salary: 1920, poverty: 14.8, population: 950, housing: 4200 },
  { id: 'alentejo', name: 'Alentejo', salary: 1350, poverty: 21.4, population: 22, housing: 1200 },
  { id: 'algarve', name: 'Algarve', salary: 1480, poverty: 16.5, population: 92, housing: 2900 },
  { id: 'acores', name: 'Açores', salary: 1410, poverty: 24.1, population: 102, housing: 1600 },
  { id: 'madeira', name: 'Madeira', salary: 1460, poverty: 23.5, population: 310, housing: 2100 },
];

export default function AtlasPage() {
  const { t } = useTranslation();
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorKey>('salary');
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);

  const indicators = [
    { id: 'salary', label: t('map.salary'), icon: TrendingUp, unit: '€' },
    { id: 'poverty', label: t('map.poverty'), icon: AlertCircle, unit: '%' },
    { id: 'population', label: t('map.population'), icon: Users, unit: ' hab/km²' },
    { id: 'housing', label: t('map.housing'), icon: Home, unit: '€/m²' },
  ];

  const getRegionColor = (value: number, key: IndicatorKey) => {
    const values = PORTUGAL_DATA_2026.map(r => r[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const ratio = (value - min) / (max - min);
    const intensity = Math.round(ratio * 80);
    return `hsl(var(--primary) / ${20 + intensity}%)`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary flex items-center gap-3">
          <MapIcon className="h-10 w-10" /> {t('map.title')}
        </h1>
        <p className="text-muted-foreground text-lg">{t('map.description')}</p>
        <div className="bg-muted/30 p-4 rounded-xl border border-muted flex gap-3 items-start mt-2">
          <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">{t('map.howItWorks')}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          <Card className="shadow-md border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Selecione o Indicador</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {indicators.map((ind) => (
                <button
                  key={ind.id}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-sm font-medium text-left",
                    selectedIndicator === ind.id 
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]" 
                      : "bg-card hover:bg-muted/50 border-border"
                  )}
                  onClick={() => setSelectedIndicator(ind.id as IndicatorKey)}
                >
                  <ind.icon className={cn("h-4 w-4", selectedIndicator === ind.id ? "text-white" : "text-primary")} />
                  {ind.label}
                </button>
              ))}
            </CardContent>
          </Card>

          {hoveredRegion ? (
            <Card className="border-primary bg-primary/5 animate-in fade-in slide-in-from-left-2 shadow-lg overflow-hidden">
              <div className="h-1 bg-primary w-full" />
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold text-primary tracking-widest">{t('map.region')}</CardDescription>
                <CardTitle className="text-2xl">{hoveredRegion.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-headline text-primary">
                    {hoveredRegion[selectedIndicator].toLocaleString()}
                    <span className="text-lg ml-1">{indicators.find(i => i.id === selectedIndicator)?.unit}</span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-accent" /> {t('map.value')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center text-muted-foreground italic bg-muted/5">
              <MapIcon className="h-8 w-8 mb-3 opacity-20" />
              <p className="text-sm">Interaja com o mapa para comparar regiões.</p>
            </Card>
          )}

          <Card className="bg-muted/20 border-none shadow-none">
            <CardContent className="pt-6">
              <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-4 tracking-widest">{t('map.legend')}</h4>
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-primary/10 via-primary/50 to-primary mb-2 shadow-inner" />
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                <span>{t('map.low')}</span>
                <span>{t('map.high')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-card rounded-3xl border shadow-xl p-8 min-h-[700px] relative overflow-hidden bg-gradient-to-br from-white to-muted/30">
          <div className="absolute top-6 right-6 z-10">
            <Badge variant="outline" className="bg-white/90 backdrop-blur border-primary/20 gap-2 py-1.5 px-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Portugal Real 2026</span>
            </Badge>
          </div>
          
          {/* MAPA SVG COM SILHUETA REALISTA */}
          <svg viewBox="0 0 400 800" className="w-full h-full max-w-[450px] drop-shadow-2xl">
            {/* NORTE */}
            <path
              d="M120,20 L280,30 L310,120 L290,220 L200,250 L130,230 L110,120 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[0][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4] hover:brightness-110"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[0])}
              onClick={() => setHoveredRegion(PORTUGAL_DATA_2026[0])}
            />
            {/* CENTRO */}
            <path
              d="M130,230 L200,250 L290,220 L330,320 L300,420 L210,440 L120,420 L110,320 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[1][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4] hover:brightness-110"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[1])}
              onClick={() => setHoveredRegion(PORTUGAL_DATA_2026[1])}
            />
            {/* LISBOA (AML) */}
            <path
              d="M120,420 L210,440 L220,500 L150,520 L100,480 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[2][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4] hover:brightness-110"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[2])}
              onClick={() => setHoveredRegion(PORTUGAL_DATA_2026[2])}
            />
            {/* ALENTEJO */}
            <path
              d="M120,420 L210,440 L300,420 L330,580 L310,680 L170,710 L150,520 L220,500 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[3][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4] hover:brightness-110"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[3])}
              onClick={() => setHoveredRegion(PORTUGAL_DATA_2026[3])}
            />
            {/* ALGARVE */}
            <path
              d="M170,710 L310,680 L320,770 L170,770 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[4][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4] hover:brightness-110"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[4])}
              onClick={() => setHoveredRegion(PORTUGAL_DATA_2026[4])}
            />
            
            {/* AÇORES - Inset Aproximado */}
            <g className="cursor-pointer group" onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[5])} onClick={() => setHoveredRegion(PORTUGAL_DATA_2026[5])}>
              <rect x="10" y="250" width="80" height="80" rx="12" fill="white" fillOpacity="0.6" stroke="hsl(var(--primary)/20%)" strokeWidth="1" strokeDasharray="4 2" />
              <path 
                d="M30,280 L50,275 L70,280 L65,300 L40,305 Z" 
                fill={getRegionColor(PORTUGAL_DATA_2026[5][selectedIndicator], selectedIndicator)} 
                stroke="white" 
                strokeWidth="2" 
                className="transition-all group-hover:stroke-accent" 
              />
              <text x="50" y="320" textAnchor="middle" className="text-[10px] font-bold fill-muted-foreground uppercase tracking-widest">Açores</text>
            </g>

            {/* MADEIRA - Inset Aproximado */}
            <g className="cursor-pointer group" onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[6])} onClick={() => setHoveredRegion(PORTUGAL_DATA_2026[6])}>
              <rect x="10" y="350" width="80" height="80" rx="12" fill="white" fillOpacity="0.6" stroke="hsl(var(--primary)/20%)" strokeWidth="1" strokeDasharray="4 2" />
              <path 
                d="M35,380 L65,385 L60,400 L40,405 Z" 
                fill={getRegionColor(PORTUGAL_DATA_2026[6][selectedIndicator], selectedIndicator)} 
                stroke="white" 
                strokeWidth="2" 
                className="transition-all group-hover:stroke-accent" 
              />
              <text x="50" y="420" textAnchor="middle" className="text-[10px] font-bold fill-muted-foreground uppercase tracking-widest">Madeira</text>
            </g>
          </svg>
          
          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground bg-white/50 px-4 py-2 rounded-full border border-primary/5 shadow-inner">
            <Info className="h-3.5 w-3.5 text-primary" />
            Clique na silhueta das regiões para ver os dados de 2026.
          </div>
        </div>
      </div>
    </div>
  );
}
