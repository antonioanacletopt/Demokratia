
'use client';

import { useState, useMemo } from 'react';
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
    
    // Inverter escala para pobreza (mais baixo é "melhor", mas aqui mostramos intensidade)
    const intensity = Math.round(ratio * 100);
    return `hsl(var(--primary) / ${20 + intensity * 0.8}%)`;
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
                <Button
                  key={ind.id}
                  variant={selectedIndicator === ind.id ? "default" : "outline"}
                  className={cn(
                    "justify-start gap-3 h-12 transition-all",
                    selectedIndicator === ind.id ? "shadow-md scale-[1.02]" : "hover:bg-primary/5"
                  )}
                  onClick={() => setSelectedIndicator(ind.id as IndicatorKey)}
                >
                  <ind.icon className={cn("h-4 w-4", selectedIndicator === ind.id ? "text-white" : "text-primary")} />
                  {ind.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {hoveredRegion ? (
            <Card className="border-primary bg-primary/5 animate-in fade-in slide-in-from-left-2 shadow-lg">
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
              <p className="text-sm">Passe o rato sobre o mapa para ver detalhes regionais.</p>
            </Card>
          )}

          <Card className="bg-muted/20 border-none shadow-none">
            <CardContent className="pt-6">
              <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-4 tracking-widest">{t('map.legend')}</h4>
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-primary/10 via-primary/50 to-primary mb-2 shadow-inner" />
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>{t('map.low')}</span>
                <span>{t('map.high')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-card rounded-3xl border shadow-xl p-8 min-h-[700px] relative overflow-hidden bg-gradient-to-br from-white to-muted/20">
          <div className="absolute top-6 right-6">
            <Badge variant="outline" className="bg-white/80 backdrop-blur border-primary/20 gap-2 py-1.5 px-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Previsão Março 2026</span>
            </Badge>
          </div>
          
          <svg viewBox="0 0 400 850" className="w-full h-full max-w-[450px] drop-shadow-2xl">
            {/* NORTE */}
            <path
              d="M120,40 L280,40 L290,120 L310,200 L200,240 L140,220 L110,120 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[0][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4] hover:brightness-110"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[0])}
            />
            {/* CENTRO */}
            <path
              d="M140,220 L200,240 L310,200 L330,370 L250,440 L150,420 L120,320 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[1][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4] hover:brightness-110"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[1])}
            />
            {/* LISBOA (AM) */}
            <path
              d="M120,320 L150,420 L180,470 L120,500 L100,440 L90,370 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[2][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4] hover:brightness-110"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[2])}
            />
            {/* ALENTEJO */}
            <path
              d="M150,420 L250,440 L330,370 L350,570 L330,670 L180,700 L120,500 L180,470 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[3][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4] hover:brightness-110"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[3])}
            />
            {/* ALGARVE */}
            <path
              d="M180,700 L330,670 L340,770 L180,770 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[4][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4] hover:brightness-110"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[4])}
            />
            
            {/* AÇORES (Representação Esquemática) */}
            <g className="cursor-pointer group" onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[5])}>
              <rect x="20" y="550" width="70" height="50" rx="8" fill={getRegionColor(PORTUGAL_DATA_2026[5][selectedIndicator], selectedIndicator)} stroke="white" strokeWidth="2" className="transition-all duration-300 group-hover:stroke-accent group-hover:stroke-[4]" />
              <text x="55" y="540" textAnchor="middle" className="text-[12px] font-bold fill-muted-foreground uppercase tracking-wider">Açores</text>
            </g>

            {/* MADEIRA (Representação Esquemática) */}
            <g className="cursor-pointer group" onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[6])}>
              <rect x="20" y="650" width="70" height="50" rx="8" fill={getRegionColor(PORTUGAL_DATA_2026[6][selectedIndicator], selectedIndicator)} stroke="white" strokeWidth="2" className="transition-all duration-300 group-hover:stroke-accent group-hover:stroke-[4]" />
              <text x="55" y="640" textAnchor="middle" className="text-[12px] font-bold fill-muted-foreground uppercase tracking-wider">Madeira</text>
            </g>
          </svg>
          
          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground bg-white/50 px-4 py-2 rounded-full border border-primary/5 shadow-inner">
            <Info className="h-3.5 w-3.5 text-primary" />
            Clique ou passe o rato nas regiões para comparar indicadores.
          </div>
        </div>
      </div>
    </div>
  );
}
