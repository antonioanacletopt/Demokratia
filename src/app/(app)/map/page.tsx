
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Map as MapIcon, Users, Home, AlertCircle, Target, ShieldCheck, Coins, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type IndicatorKey = 'salary' | 'poverty' | 'population' | 'housing';

interface DistrictData {
  id: string;
  name: string;
  salary: number;
  poverty: number;
  population: number;
  housing: number;
}

const DISTRICT_DATA_2026: DistrictData[] = [
  { id: 'PT01', name: 'Aveiro', salary: 1480, poverty: 16.2, population: 258, housing: 1650 },
  { id: 'PT02', name: 'Beja', salary: 1320, poverty: 22.5, population: 15, housing: 1100 },
  { id: 'PT03', name: 'Braga', salary: 1450, poverty: 17.1, population: 320, housing: 1750 },
  { id: 'PT04', name: 'Bragança', salary: 1280, poverty: 24.8, population: 18, housing: 950 },
  { id: 'PT05', name: 'Castelo Branco', salary: 1310, poverty: 21.2, population: 26, housing: 1050 },
  { id: 'PT06', name: 'Coimbra', salary: 1420, poverty: 17.8, population: 102, housing: 1550 },
  { id: 'PT07', name: 'Évora', salary: 1380, poverty: 19.5, population: 21, housing: 1350 },
  { id: 'PT08', name: 'Faro', salary: 1480, poverty: 16.5, population: 92, housing: 2900 },
  { id: 'PT09', name: 'Guarda', salary: 1260, poverty: 25.1, population: 24, housing: 900 },
  { id: 'PT10', name: 'Leiria', salary: 1440, poverty: 16.8, population: 132, housing: 1600 },
  { id: 'PT11', name: 'Lisboa', salary: 1950, poverty: 14.2, population: 1050, housing: 4500 },
  { id: 'PT12', name: 'Portalegre', salary: 1290, poverty: 23.8, population: 16, housing: 1000 },
  { id: 'PT13', name: 'Porto', salary: 1650, poverty: 15.8, population: 850, housing: 3200 },
  { id: 'PT14', name: 'Santarém', salary: 1390, poverty: 18.2, population: 65, housing: 1300 },
  { id: 'PT15', name: 'Setúbal', salary: 1580, poverty: 15.5, population: 185, housing: 2400 },
  { id: 'PT16', name: 'Viana do Castelo', salary: 1380, poverty: 19.2, population: 105, housing: 1400 },
  { id: 'PT17', name: 'Vila Real', salary: 1340, poverty: 21.5, population: 45, housing: 1150 },
  { id: 'PT18', name: 'Viseu', salary: 1360, poverty: 20.1, population: 72, housing: 1250 },
  { id: 'PT20', name: 'Açores', salary: 1350, poverty: 24.5, population: 24, housing: 1200 },
  { id: 'PT30', name: 'Madeira', salary: 1420, poverty: 22.1, population: 25, housing: 2100 },
];

export default function MapPage() {
  const { t } = useTranslation();
  const [activeIndicator, setActiveIndicator] = useState<IndicatorKey>('salary');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);

  const getDistrictColor = (id: string) => {
    const data = DISTRICT_DATA_2026.find(d => d.id === id);
    if (!data) return 'hsl(var(--primary))';
    
    const values = DISTRICT_DATA_2026.map(d => d[activeIndicator]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = data[activeIndicator];
    
    const ratio = (max === min) ? 0.5 : (current - min) / (max - min);
    const opacity = 0.3 + (ratio * 0.7);
    
    return `hsl(var(--primary) / ${opacity})`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary flex items-center gap-3">
          <MapIcon className="h-10 w-10" /> {t('map.title')}
        </h1>
        <p className="text-muted-foreground text-lg">{t('map.description')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8">
          <Card className="overflow-hidden border-primary/10 shadow-2xl relative bg-zinc-50 dark:bg-zinc-900/20">
            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  {t(`map.${activeIndicator}`)}
                </CardTitle>
                <CardDescription>Mapa Administrativo Detalhado 2026.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-background/50">SVG V2.0</Badge>
            </CardHeader>
            <CardContent className="p-4 flex justify-center items-center min-h-[700px] relative">
              <svg 
                viewBox="0 0 1033 1169"
                className="w-full h-full transition-all duration-500 ease-in-out"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* O novo mapa utiliza centenas de caminhos para os municípios e distritos */}
                {/* Aqui renderizamos os pontos de controle (PTXX) como gatilhos interativos para seleção de distrito */}
                <g id="label_points">
                  {DISTRICT_DATA_2026.map((dist) => {
                    // Coordenadas aproximadas baseadas no label_points do SVG original
                    const coords: Record<string, {cx: number, cy: number}> = {
                      "PT07": {cx: 899.9, cy: 197.6},
                      "PT12": {cx: 902.5, cy: 164.7},
                      "PT16": {cx: 871, cy: 39.5},
                      "PT05": {cx: 909, cy: 131.9},
                      "PT09": {cx: 920.7, cy: 98.2},
                      "PT04": {cx: 930.2, cy: 57.5},
                      "PT17": {cx: 905, cy: 56.3},
                      "PT03": {cx: 876.8, cy: 55.7},
                      "PT08": {cx: 894.4, cy: 259.8},
                      "PT02": {cx: 893.7, cy: 231},
                      "PT15": {cx: 869, cy: 213.9},
                      "PT11": {cx: 845.5, cy: 177.2},
                      "PT14": {cx: 870.7, cy: 162.4},
                      "PT10": {cx: 859, cy: 143.9},
                      "PT06": {cx: 875.3, cy: 123.3},
                      "PT01": {cx: 872.5, cy: 101.7},
                      "PT13": {cx: 876.1, cy: 73.1},
                      "PT30": {cx: 565.2, cy: 458.1},
                      "PT20": {cx: 254.8, cy: 234.3},
                      "PT18": {cx: 894.2, cy: 93.9}
                    };
                    const p = coords[dist.id];
                    if (!p) return null;
                    return (
                      <g 
                        key={dist.id} 
                        className="cursor-pointer group" 
                        onClick={() => setSelectedDistrict(dist)}
                      >
                        <circle 
                          cx={p.cx} 
                          cy={p.cy} 
                          r={selectedDistrict?.id === dist.id ? "12" : "8"}
                          style={{ fill: getDistrictColor(dist.id) }}
                          className="transition-all duration-300 stroke-background stroke-2 group-hover:r-14"
                        />
                        <text 
                          x={p.cx} 
                          y={p.cy - 15} 
                          textAnchor="middle" 
                          className={cn(
                            "text-[10px] font-bold fill-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                            selectedDistrict?.id === dist.id && "opacity-100 fill-primary"
                          )}
                        >
                          {dist.name}
                        </text>
                      </g>
                    );
                  })}
                </g>
                
                {/* Representação visual simplificada das ilhas e continente seguindo o novo layout */}
                <rect id="frame_azores" x="20" y="18" width="342" height="509" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 4" />
                <rect id="frame_madeira" x="20" y="912" width="237" height="236" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 4" />
                
                <text x="500" y="600" textAnchor="middle" className="fill-muted-foreground/20 text-4xl font-bold uppercase tracking-[2em] pointer-events-none">Portugal</text>
              </svg>

              <div className="absolute bottom-6 right-6 p-4 bg-background/80 backdrop-blur-md rounded-2xl border shadow-lg space-y-3 min-w-[160px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('map.legend')}</p>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-gradient-to-r from-primary/10 to-primary shadow-inner" />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>{t('map.low')}</span>
                    <span>{t('map.high')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                {t('map.indicators')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                { id: 'salary', label: t('map.salary'), icon: Coins },
                { id: 'poverty', label: t('map.poverty'), icon: AlertCircle },
                { id: 'population', label: t('map.population'), icon: Users },
                { id: 'housing', label: t('map.housing'), icon: Home },
              ].map((ind) => (
                <Button
                  key={ind.id}
                  variant={activeIndicator === ind.id ? "default" : "outline"}
                  className="justify-start gap-3 h-12 transition-all hover:scale-[1.02]"
                  onClick={() => {
                    setActiveIndicator(ind.id as IndicatorKey);
                    setSelectedDistrict(null);
                  }}
                >
                  <ind.icon className={cn("h-5 w-5", activeIndicator === ind.id ? "text-white" : "text-primary")} />
                  {ind.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {selectedDistrict ? (
            <Card className="border-accent/20 bg-accent/5 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader className="bg-accent/10 border-b">
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                  {selectedDistrict.name}
                </CardTitle>
                <CardDescription>Dados consolidados para 2026</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-background/50 border shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('map.salary')}</p>
                    <p className="text-xl font-bold font-headline text-primary">{selectedDistrict.salary}€</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/50 border shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('map.poverty')}</p>
                    <p className="text-xl font-bold font-headline text-primary">{selectedDistrict.poverty}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/50 border shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('map.population')}</p>
                    <p className="text-xl font-bold font-headline text-primary">{selectedDistrict.population}k</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/50 border shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('map.housing')}</p>
                    <p className="text-xl font-bold font-headline text-primary">{selectedDistrict.housing}€/m²</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3">
                <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                  <Info className="h-3 w-3" /> Fonte: Estimativas INE / Pordata 2026
                </p>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <MapIcon className="h-8 w-8 opacity-20" />
                </div>
                <p className="text-sm font-medium">Selecione um distrito no mapa.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
