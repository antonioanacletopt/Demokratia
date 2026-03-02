'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Map as MapIcon, Users, Home, AlertCircle, Target, ShieldCheck, Coins, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import PortugalMap from './mapa_portugal.svg';

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
  { id: 'path-aveiro', name: 'Aveiro', salary: 1480, poverty: 16.2, population: 258, housing: 1650 },
  { id: 'path-beja', name: 'Beja', salary: 1320, poverty: 22.5, population: 15, housing: 1100 },
  { id: 'path-braga', name: 'Braga', salary: 1450, poverty: 17.1, population: 320, housing: 1750 },
  { id: 'path-braganca', name: 'Bragança', salary: 1280, poverty: 24.8, population: 18, housing: 950 },
  { id: 'path-castelo-branco', name: 'Castelo Branco', salary: 1310, poverty: 21.2, population: 26, housing: 1050 },
  { id: 'path-coimbra', name: 'Coimbra', salary: 1420, poverty: 17.8, population: 102, housing: 1550 },
  { id: 'path-evora', name: 'Évora', salary: 1380, poverty: 19.5, population: 21, housing: 1350 },
  { id: 'path-faro', name: 'Faro', salary: 1480, poverty: 16.5, population: 92, housing: 2900 },
  { id: 'path-guarda', name: 'Guarda', salary: 1260, poverty: 25.1, population: 24, housing: 900 },
  { id: 'path-leiria', name: 'Leiria', salary: 1440, poverty: 16.8, population: 132, housing: 1600 },
  { id: 'path-lisboa', name: 'Lisboa', salary: 1950, poverty: 14.2, population: 1050, housing: 4500 },
  { id: 'path-portalegre', name: 'Portalegre', salary: 1290, poverty: 23.8, population: 16, housing: 1000 },
  { id: 'path-porto', name: 'Porto', salary: 1650, poverty: 15.8, population: 850, housing: 3200 },
  { id: 'path-santarem', name: 'Santarém', salary: 1390, poverty: 18.2, population: 65, housing: 1300 },
  { id: 'path-setubal', name: 'Setúbal', salary: 1580, poverty: 15.5, population: 185, housing: 2400 },
  { id: 'path-viana-do-castelo', name: 'Viana do Castelo', salary: 1380, poverty: 19.2, population: 105, housing: 1400 },
  { id: 'path-vila-real', name: 'Vila Real', salary: 1340, poverty: 21.5, population: 45, housing: 1150 },
  { id: 'path-viseu', name: 'Viseu', salary: 1360, poverty: 20.1, population: 72, housing: 1250 },
  { id: 'path-acores', name: 'Açores', salary: 1350, poverty: 24.5, population: 24, housing: 1200 },
  { id: 'path-madeira', name: 'Madeira', salary: 1420, poverty: 22.1, population: 25, housing: 2100 },
];

export default function MapPage() {
  const { t } = useTranslation();
  const [activeIndicator, setActiveIndicator] = useState<IndicatorKey>('salary');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const getIndicatorColor = (value: number, min: number, max: number, isReversed: boolean) => {
    const ratio = (max === min) ? 0.5 : (value - min) / (max - min);
    const finalRatio = isReversed ? 1 - ratio : ratio;
    const opacity = 0.2 + (finalRatio * 0.8);
    return `hsl(217 91% 60% / ${opacity})`;
  };

  const handleDistrictClick = (districtId: string) => {
    const district = DISTRICT_DATA_2026.find(d => d.id === districtId);
    if (district) {
      setSelectedDistrict(district);
    }
  };

  useEffect(() => {
    const svgContainer = mapContainerRef.current;
    if (!svgContainer) return;

    // Cache to store click handlers to be able to remove them later
    const clickHandlers = new Map<SVGPathElement, () => void>();

    const processMap = () => {
      const svgElement = svgContainer.querySelector('svg');
      if (!svgElement) return;

      const values = DISTRICT_DATA_2026.map(d => d[activeIndicator]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const isReversed = activeIndicator === 'poverty';

      DISTRICT_DATA_2026.forEach(district => {
        const pathElement = svgElement.querySelector(`#${district.id}`) as SVGPathElement | null;
        if (pathElement) {
          const color = getIndicatorColor(district[activeIndicator], min, max, isReversed);
          pathElement.style.fill = color;
          pathElement.style.transition = 'fill 0.3s ease, filter 0.3s ease';
          pathElement.style.cursor = 'pointer';

          // Remove old listener before adding a new one
          if (clickHandlers.has(pathElement)) {
            pathElement.removeEventListener('click', clickHandlers.get(pathElement)!);
          }
          
          const newClickHandler = () => handleDistrictClick(district.id);
          pathElement.addEventListener('click', newClickHandler);
          clickHandlers.set(pathElement, newClickHandler); // Store the new handler

          pathElement.addEventListener('mouseenter', () => { pathElement.style.filter = 'brightness(1.2)'; });
          pathElement.addEventListener('mouseleave', () => { pathElement.style.filter = 'none'; });
        }
      });
    };

    // Check if SVG is already loaded
    if (svgContainer.querySelector('svg')) {
      processMap();
    } else {
      fetch(PortugalMap.src)
        .then(response => response.text())
        .then(svgText => {
          if (svgContainer) {
            svgContainer.innerHTML = svgText;
            processMap();
          }
        });
    }
    
    // Cleanup function to remove event listeners
    return () => {
      const svgElement = svgContainer.querySelector('svg');
      if (svgElement) {
        clickHandlers.forEach((handler, element) => {
          element.removeEventListener('click', handler);
        });
      }
    };

  }, [activeIndicator]);
  
  const isReversed = activeIndicator === 'poverty';
  const baseHslColor = '217 91% 60%';
  const gradientStyle = {
    background: `linear-gradient(to right, hsl(${baseHslColor} / ${isReversed ? 1.0 : 0.2}), hsl(${baseHslColor} / ${isReversed ? 0.2 : 1.0}))`
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
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                {t(`map.${activeIndicator}`)}
              </CardTitle>
              <Badge variant="outline" className="bg-background/50 uppercase tracking-tighter">Atlas 2026</Badge>
            </CardHeader>
            <CardContent className="p-4 flex justify-center items-center min-h-[700px]">
              <div ref={mapContainerRef} className="w-full h-full" />
              <div className="absolute bottom-6 right-6 p-4 bg-background/90 backdrop-blur-md rounded-2xl border shadow-lg space-y-3 min-w-[180px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('map.legend')}</p>
                <div className="space-y-2">
                  <div 
                    className="h-3 w-full rounded-full shadow-inner"
                    style={gradientStyle}
                  />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>{t(isReversed ? 'map.high' : 'map.low')}</span>
                    <span>{t(isReversed ? 'map.low' : 'map.high')}</span>
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
                <button
                  key={ind.id}
                  className={cn(
                    "flex items-center gap-3 h-12 px-4 rounded-xl border transition-all hover:scale-[1.02] text-left text-sm font-medium",
                    activeIndicator === ind.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
                  )}
                  onClick={() => {
                    setActiveIndicator(ind.id as IndicatorKey);
                    setSelectedDistrict(null);
                  }}
                >
                  <ind.icon className={cn("h-5 w-5", activeIndicator === ind.id ? "text-primary-foreground" : "text-primary")} />
                  {ind.label}
                </button>
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
                  <div className="p-4 rounded-2xl bg-background border shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('map.salary')}</p>
                    <p className="text-xl font-bold font-headline text-primary">{selectedDistrict.salary}€</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background border shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('map.poverty')}</p>
                    <p className="text-xl font-bold font-headline text-primary">{selectedDistrict.poverty}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background border shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{t('map.population')}</p>
                    <p className="text-xl font-bold font-headline text-primary">{selectedDistrict.population}k</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background border shadow-sm">
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
