
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
        {/* SIDEBAR SELECTION */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Indicadores</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {indicators.map((ind) => (
                <Button
                  key={ind.id}
                  variant={selectedIndicator === ind.id ? "default" : "outline"}
                  className="justify-start gap-3 h-12"
                  onClick={() => setSelectedIndicator(ind.id as IndicatorKey)}
                >
                  <ind.icon className="h-4 w-4" />
                  {ind.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {hoveredRegion ? (
            <Card className="border-primary bg-primary/5 animate-in fade-in slide-in-from-left-2">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase font-bold text-primary">{t('map.region')}</CardDescription>
                <CardTitle>{hoveredRegion.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold font-headline">
                    {hoveredRegion[selectedIndicator]}
                    {indicators.find(i => i.id === selectedIndicator)?.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">{t('map.value')}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed flex items-center justify-center p-12 text-center text-muted-foreground italic">
              <p className="text-sm">Passe o rato sobre o mapa para ver detalhes regionais.</p>
            </Card>
          )}

          <Card className="bg-muted/20 border-none shadow-none">
            <CardContent className="pt-6">
              <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-4">{t('map.legend')}</h4>
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-primary/20 to-primary mb-2" />
              <div className="flex justify-between text-[10px] font-bold">
                <span>{t('map.low')}</span>
                <span>{t('map.high')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MAP VISUALIZATION */}
        <div className="lg:col-span-2 flex items-center justify-center bg-card rounded-3xl border shadow-inner p-8 min-h-[600px] relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-background/80 backdrop-blur border-primary/20 gap-1.5 py-1">
              <Sparkles className="h-3 w-3 text-accent" />
              Previsão Março 2026
            </Badge>
          </div>
          
          <svg viewBox="0 0 400 600" className="w-full h-full max-w-[450px] drop-shadow-2xl">
            {/* Norte */}
            <path
              d="M150 50 L250 50 L280 150 L180 180 L120 120 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[0][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-colors duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4]"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[0])}
            />
            {/* Centro */}
            <path
              d="M180 180 L280 150 L300 300 L150 320 L120 250 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[1][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-colors duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4]"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[1])}
            />
            {/* Lisboa */}
            <path
              d="M150 320 L180 320 L180 380 L120 380 L110 340 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[2][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-colors duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4]"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[2])}
            />
            {/* Alentejo */}
            <path
              d="M180 320 L300 300 L320 450 L180 480 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[3][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-colors duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4]"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[3])}
            />
            {/* Algarve */}
            <path
              d="M180 480 L320 450 L320 530 L180 530 Z"
              fill={getRegionColor(PORTUGAL_DATA_2026[4][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-colors duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4]"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[4])}
            />
            
            {/* Açores (Simplified Box) */}
            <rect
              x="20" y="450" width="60" height="40"
              fill={getRegionColor(PORTUGAL_DATA_2026[5][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-colors duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4]"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[5])}
            />
            <text x="25" y="440" className="text-[10px] font-bold fill-muted-foreground">Açores</text>

            {/* Madeira (Simplified Box) */}
            <rect
              x="20" y="520" width="60" height="40"
              fill={getRegionColor(PORTUGAL_DATA_2026[6][selectedIndicator], selectedIndicator)}
              stroke="white"
              strokeWidth="2"
              className="transition-colors duration-300 cursor-pointer hover:stroke-accent hover:stroke-[4]"
              onMouseEnter={() => setHoveredRegion(PORTUGAL_DATA_2026[6])}
            />
            <text x="25" y="515" className="text-[10px] font-bold fill-muted-foreground">Madeira</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
