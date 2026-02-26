
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
    if (!data) return 'hsl(var(--muted))';
    const values = DISTRICT_DATA_2026.map(d => d[activeIndicator]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = data[activeIndicator];
    const ratio = (max === min) ? 0.5 : (current - min) / (max - min);
    // Usamos cores da escala primária (azul) para o heatmap
    const opacity = 0.4 + (ratio * 0.6);
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
                <CardDescription>Mapa Administrativo Organizado 2026.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-background/50">PRO V2.5</Badge>
            </CardHeader>
            <CardContent className="p-4 flex justify-center items-center min-h-[700px] relative">
              <svg 
                viewBox="0 0 1033 1169"
                className="w-full h-full transition-all duration-500 ease-in-out"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Camada de Polígonos (Contornos e Preenchimento de Base) */}
                <g id="layer1" className="fill-white dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600 stroke-[0.5]">
                  <path d="m 88.671,1070.457 1.655,-0.828 0.509,0.255 1.145,-1.145 1.273,-2.164 -0.573,-1.464 0.955,-3.309 1.145,-0.954 0.51,-0.89 1.336,-0.128 -0.828,-0.827 0.128,-1.146 -0.955,-0.763 1.273,-0.446 0.19,-0.509 -0.827,-0.445 0.064,-1.337 -1.336,0.191 h -0.7 l -0.382,-1.082 -0.89,0.319 -0.892,0.827 -0.89,0.445 -0.955,-0.954 0.063,-0.764 H 89.18 l -1.081,0.7 -0.191,1.018 -0.891,0.7 h -1.91 l -0.763,1.273 -0.19,0.89 -1.083,-0.127 -0.509,0.319 c 0,0 0.128,1.527 0.064,1.781 -0.064,0.255 -1.082,2.546 -1.082,2.546 l -1.463,1.4 -1.273,2.863 -0.455,2.747 0.645,0.018 v 0.097 c 0.127,0.021 0.232,0.078 0.353,0.118 0.097,0.04 0.203,0.064 0.3,0.092 0.155,0.064 0.302,0.15 0.457,0.197 0.225,0.07 0.473,0.073 0.701,0.133 0.09,0.03 0.144,0.072 0.254,0.072 l 0.024,0.102 a 0.892,0.892 0 0 0 0.18,0.12 l 0.024,0.024 c 0.023,0.03 0.033,0.07 0.054,0.102 0.068,0.066 0.136,0.131 0.205,0.195 l 0.028,0.151 0.151,0.021 0.076,0.074 0.024,0.152 c 0.201,0.025 0.219,0.074 0.279,0.247 l 0.025,0.024 c 0.062,0.06 0.081,0.097 0.128,0.17 0.009,0.022 0.052,0.04 0.075,0.05 l 0.022,-0.102 c 0.075,-0.127 0.59,-0.085 0.726,-0.066 v 0.102 c 0.164,0 0.339,0.08 0.504,0.115 l 0.025,0.024 0.026,0.102 0.032,0.02 0.017,0.027 h 0.05 v -0.049 l -0.033,-0.019 -0.017,-0.035 h 0.102 l 0.024,0.102 c 0.008,0 0.078,0.072 0.078,0.072 0.183,0.057 0.295,0.116 0.502,0.116 v 0.097 c 0.081,0.015 0.169,0.025 0.249,0.049 v 0.1 c 0.165,-0.013 0.384,-0.056 0.55,-0.034 0.168,0.024 0.249,0.112 0.487,0.13 l 0.019,0.03 0.15,0.025 c 0.066,0.058 0.115,0.068 0.204,0.092 0.002,0 0.152,0.151 0.152,0.151 0.122,0.04 0.213,0.062 0.303,0.145 0.212,0 0.449,-0.039 0.652,0.037 l 0.365,0.22 z" />
                  <path d="m 129.7,1062.824 -3.408,-3.098 -3.873,-0.774 -2.168,-1.704 h -1.24 l -2.478,2.323 -1.394,0.155 -1.59,0.86 -1.042,0.824 -1.24,1.259 0.525,0.731 0.577,0.62 1.995,0.355 0.843,1.375 -0.222,2.35 1.153,2.75 1.773,0.443 0.045,1.197 -0.931,0.399 -0.266,0.399 1.108,0.754 -0.226,3.337 0.575,-0.24 c 0.074,0 0.163,-0.013 0.237,0 0.13,0.015 0.263,0.064 0.4,0.043 l 0.049,-0.055 c 0.173,0 0.345,-0.077 0.497,-0.158 0.042,-0.02 0.105,-0.063 0.149,-0.078 0.145,-0.045 0.332,-0.014 0.476,0.015 0.096,0.012 0.29,-0.043 0.341,0.066 l -0.011,-0.041 h 0.045 l 0.022,0.024 0.011,-0.045 a 0.349,0.349 0 0 1 0.168,0.092 h 0.052 l 0.024,-0.024 0.022,-0.204 c 0.06,-0.012 0.14,0.037 0.2,0.024 l -0.026,-0.086 c 0.035,0 0.07,0 0.103,0.013 l 0.048,-0.201 c 0.008,-0.021 0.055,-0.043 0.077,-0.055 l 0.04,-0.15 c 0.08,-0.043 0.174,-0.08 0.25,-0.128 0.035,-0.026 0.071,-0.064 0.107,-0.088 0.097,-0.06 0.22,-0.02 0.314,-0.072 l 0.014,-0.092 -0.087,-0.054 c 0.004,-0.058 0.032,-0.166 0.073,-0.206 l 0.057,0.062 0.072,0.013 0.025,-0.026 -0.021,-0.023 -0.013,0.037 -0.055,-0.013 -0.052,-0.066 0.041,-0.031 0.066,0.055 a 0.677,0.677 0 0 1 -0.068,-0.1 l 0.017,-0.034 h 0.058 l 0.012,-0.024 c -0.025,-0.015 -0.064,-0.026 -0.088,-0.047 l 0.133,-0.028 0.078,0.084 0.06,-0.028 -0.03,-0.1 -0.06,-0.046 c 0.035,-0.133 0.402,-0.37 0.526,-0.299 a 0.123,0.123 0 0 1 0.062,-0.019 l 0.049,0.066 c 0.061,0 0.12,0.051 0.182,0.051 -0.015,-0.024 -0.056,-0.094 -0.044,-0.124 0.07,-0.02 0.146,-0.029 0.21,-0.055 0.04,-0.015 0.074,-0.045 0.115,-0.058 h 0.07 l 0.054,-0.043 h 0.03 l 0.1,-0.107 0.066,0.013 0.037,-0.049 c -0.02,-0.023 -0.072,-0.07 -0.103,-0.07 l 0.132,-0.03 -0.013,-0.11 0.079,-0.11 0.072,0.017 0.013,-0.024 -0.055,-0.055 -0.013,-0.07 0.15,-0.037 -0.042,-0.043 v -0.066 c 0.023,-0.027 0.283,-0.201 0.304,-0.201 l 0.028,-0.073 h 0.025 l 0.037,0.039 0.02,-0.04 v -0.027 c 0.123,-0.126 0.237,-0.26 0.34,-0.403 0.036,-0.058 0.073,-0.167 0.055,-0.235 l 0.022,-0.024 c 0.04,0 0.089,0.023 0.128,0.01 v -0.05 h -0.229 c 0.015,-0.144 0.03,-0.225 0.141,-0.325 0.15,-0.036 0.216,-0.058 0.321,-0.158 l 0.016,-0.111 0.26,0.133 c 0.06,-0.043 0.05,-0.138 0.05,-0.197 0.033,-0.024 0.1,-0.086 0.112,-0.124 l -0.04,-0.013 a 1.588,1.588 0 0 1 0,-0.169 c -0.044,-0.055 -0.065,-0.117 -0.03,-0.178 l 0.03,-0.015 c 0.043,-0.06 0.126,-0.188 0.138,-0.26 l -0.036,-0.046 0.019,-0.045 -0.071,-0.06 0.052,-0.02 -0.066,-0.11 c 0.03,-0.068 -0.015,-0.135 -0.015,-0.203 0,-0.126 0.093,-0.188 0.104,-0.308 l 0.044,-0.023 -0.027,-0.047 0.011,-0.129 h 0.043 v -0.03 l 0.024,-0.024 -0.025,-0.034 0.04,-0.073 c -0.035,-0.074 0.052,-0.19 0.097,-0.249 v -0.049 c 0.065,-0.072 0.15,-0.094 0.224,-0.154 0.128,-0.105 0.316,-0.593 0.34,-0.744 l 0.06,-0.024 v -0.023 l -0.05,-0.051 0.026,-0.043 c 0.111,-0.02 0.162,-0.16 0.294,-0.215 l 0.023,-0.04 -0.058,-0.05 c 0.015,-0.03 0.023,-0.068 0.04,-0.104 l 0.018,0.019 a 0.27,0.27 0 0 0 0.117,-0.116 c -0.02,-0.012 -0.043,-0.024 -0.054,-0.043 l -0.025,-0.012 a 0.593,0.593 0 0 1 0.05,-0.068 l 0.075,0.026 -0.024,-0.031 0.067,-0.124 -0.035,-0.041 a 0.762,0.762 0 0 1 0.157,-0.178 0.101,0.101 0 0 0 0.066,-0.028 c 0.024,-0.03 0.033,-0.064 0.063,-0.09 0.098,-0.09 0.366,-0.333 0.466,-0.37 0.037,-0.022 0.158,-0.022 0.202,-0.022 0.058,-0.074 0.23,-0.05 0.313,-0.05 0.038,0.012 0.068,-0.026 0.11,-0.016 0.023,0.035 0.111,0.065 0.142,0.081 l 0.106,-0.023 0.011,0.035 -0.073,0.057 c 0.102,-0.03 0.281,-0.082 0.306,-0.194 0.026,-0.04 0.19,-0.062 0.283,-0.161 0.098,-0.02 0.208,-0.03 0.303,-0.055 0.062,-0.017 0.074,-0.056 0.145,-0.056 h 0.305 c 0.081,-0.086 0.454,-0.273 0.546,-0.185 0.02,-0.14 0.045,-0.273 0.072,-0.406 0.079,-0.094 0.105,-0.184 0.142,-0.308 0.005,0 0.053,-0.039 0.053,-0.049 l 0.045,-0.151 c 0.002,-0.011 0.05,-0.05 0.05,-0.05 l 0.045,-0.203 0.052,-0.052 c 0.031,-0.17 0.073,-0.34 0.061,-0.513 0.028,-0.053 1.025,-1.081 1.21,-1.266 0.068,-0.075 0.176,-0.102 0.219,-0.202 0.05,-0.12 -0.053,-0.472 0.011,-0.558 l -0.086,-0.398 z" />
                </g>

                {/* Camada 3: Molduras e Divisórias */}
                <g id="layer3" className="fill-none stroke-zinc-500 dark:stroke-zinc-400 stroke-[1.5]">
                  <rect id="frame_azores" x="20" y="18" width="342" height="509" className="stroke-[1] opacity-30" strokeDasharray="4 4" />
                  <rect id="frame_madeira" x="20" y="912" width="237" height="236" className="stroke-[1] opacity-30" strokeDasharray="4 4" />
                  <path d="M 360.752,252.117 H 17.386" className="opacity-20" />
                  <path d="m 132.606,251.85 v 158.734 l -116.94,-0.15" className="opacity-20" />
                </g>

                {/* Pontos de Interatividade e Cores baseadas em Dados */}
                <g id="label_points">
                  {DISTRICT_DATA_2026.map((dist) => {
                    const coords: Record<string, {cx: number, cy: number}> = {
                      "PT07": {cx: 899.9, cy: 197.6}, "PT12": {cx: 902.5, cy: 164.7},
                      "PT16": {cx: 871, cy: 39.5}, "PT05": {cx: 909, cy: 131.9},
                      "PT09": {cx: 920.7, cy: 98.2}, "PT04": {cx: 930.2, cy: 57.5},
                      "PT17": {cx: 905, cy: 56.3}, "PT03": {cx: 876.8, cy: 55.7},
                      "PT08": {cx: 894.4, cy: 259.8}, "PT02": {cx: 893.7, cy: 231},
                      "PT15": {cx: 869, cy: 213.9}, "PT11": {cx: 845.5, cy: 177.2},
                      "PT14": {cx: 870.7, cy: 162.4}, "PT10": {cx: 859, cy: 143.9},
                      "PT06": {cx: 875.3, cy: 123.3}, "PT01": {cx: 872.5, cy: 101.7},
                      "PT13": {cx: 876.1, cy: 73.1}, "PT30": {cx: 565.2, cy: 458.1},
                      "PT20": {cx: 254.8, cy: 234.3}, "PT18": {cx: 894.2, cy: 93.9}
                    };
                    const p = coords[dist.id];
                    if (!p) return null;
                    const isActive = selectedDistrict?.id === dist.id;
                    return (
                      <g key={dist.id} className="cursor-pointer group" onClick={() => setSelectedDistrict(dist)}>
                        <circle 
                          cx={p.cx} cy={p.cy} 
                          r={isActive ? "16" : "12"}
                          fill={getDistrictColor(dist.id)}
                          className={cn(
                            "transition-all duration-300 stroke-white dark:stroke-black stroke-2 shadow-sm group-hover:r-18",
                            isActive && "stroke-accent stroke-[3px]"
                          )}
                        />
                        <text 
                          x={p.cx} y={p.cy - 22} 
                          textAnchor="middle" 
                          className={cn(
                            "text-[14px] font-bold fill-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none drop-shadow-sm",
                            isActive && "opacity-100 fill-primary"
                          )}
                        >
                          {dist.name}
                        </text>
                      </g>
                    );
                  })}
                </g>
                <text x="500" y="600" textAnchor="middle" className="fill-muted-foreground/10 text-4xl font-bold uppercase tracking-[2em] pointer-events-none">Portugal</text>
              </svg>

              {/* Legenda de Heatmap */}
              <div className="absolute bottom-6 right-6 p-4 bg-background/90 backdrop-blur-md rounded-2xl border shadow-lg space-y-3 min-w-[180px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('map.legend')}</p>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-gradient-to-r from-primary/20 via-primary/60 to-primary shadow-inner" />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>{t('map.low')}</span>
                    <span>{t('map.high')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel Lateral de Dados */}
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
                <p className="text-sm font-medium">Selecione um ponto no mapa.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
