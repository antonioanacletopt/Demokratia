'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const MAP_PATHS = {
  'path-viseu': "m 48.82,462.56 c 0.56,0.05 1.16,-0.03 1.7,0.15 0.7,0.25 1.47,0.36 1.91,-0.38 0.64,-0.65 1.34,-1.45 2.33,-1.46 0.31,0.02 0.83,0.24 1.23,0.26 -0.06,0.2 -0.05,0.4 0.02,0.59 -0.05,-0.17 -0.05,-0.35 0,-0.53 0.72,0.04 1.31,-0.5 2.02,-0.37 0.73,0.28 1.56,0.38 2.35,0.31 0.91,0 1.27,-1.5 2.13,-1.27 -0.04,-0.03 -0.08,-0.06 -0.11,-0.1 0.47,-0.66 0.69,-2.24 1.77,-1.3 0.83,0.92 1.6,-0.24 1.87,-1.01 0.83,-0.93 2.2,-0.18 3.24,-0.49 0.8,-0.32 0.84,-1.77 1.86,-1.57 0.86,0.36 1.74,0.6 2.56,1.05 1.03,0.3 1.95,0.86 2.22,1.96 0.37,0.88 1.06,1.49 1.02,2.48 0.98,0.17 0.83,1.78 1.95,1.69 0.93,0.03 1.93,-0.3 2.82,-0.13 1.15,0.78 -0.32,1.63 -0.42,2.52 -0.3,1.01 -0.91,1.81 -1.01,2.9 -0.35,0.91 -0.03,1.92 -0.63,2.71 -0.55,0.37 -0.07,1.24 -0.34,1.52 0.06,-0.02 0.12,-0.05 0.18,-0.1 0.64,0.45 -0.51,0.66 -0.24,1.17 -0.46,0.63 0.63,0.97 0.24,1.59 0.49,0.29 0.55,1.57 -0.33,1.64 -0.7,0.15 -1.32,-0.32 -2.02,-0.25 -1.19,-0.03 -0.14,1.1 -0.48,1.72 -0.38,0.51 0.09,0.4 0.46,0.43 0.68,0.15 0.71,1.12 1.52,1.2 0.75,-0.21 1.34,0.37 1.81,0.93 0.34,0.54 -0.31,1.26 -0.34,1.85 -0.38,0.66 0.35,1.42 -0.22,1.97 -0.47,0.38 -1.16,0.42 -1.67,0.77 -0.18,0.69 -0.86,1.63 -1.61,1.6 -0.51,-0.34 -1.02,-0.48 -1.6,-0.47 -0.47,-0.5 -1.27,0.03 -1.63,-0.37 -0.04,-0.15 -0.1,-0.3 -0.16,-0.45 0.18,0.58 0.1,1.19 -0.43,1.74 -0.81,1.05 0.25,1.58 0.93,2.2 0.83,0.49 1.09,1.17 0.58,2.01 -0.26,0.92 -0.68,1.9 -1.35,2.56 -0.05,0.95 -0.89,1.69 -1.31,2.44 -0.49,1.08 -1.56,0.1 -1.87,-0.7 -0.74,-0.35 -1.56,-0.74 -1.57,-1.74 -0.82,-0.53 -1,-1.53 -2.07,-1.76 -0.61,-1.12 -1.89,-0.4 -2.81,-0.88 -0.55,-0.27 -1.29,-0.98 -1.34,0.05 -0.77,0.76 -1.76,1.51 -1.77,2.69 0.1,0.48 0,1.19 -0.37,1.17 0.47,0.43 -0.55,1.43 -0.64,2.04 -0.18,0.97 -1.2,1.34 -1.49,2.21 -0.22,0.58 -0.37,1.04 0.4,1.17 0.36,0.82 1.5,0.44 2.14,1.01 0.68,0.42 1.32,1.01 1.5,1.8 0.02,0.62 -0.62,1.36 -1.2,1.66 -0.36,0.37 -0.93,0.64 -0.91,1.14 0.24,-0.04 0.49,0.17 0.57,0.56 0.1,0.7 0.66,0.99 1.21,1.22 0.09,0.92 0.93,1.09 1.67,0.9 0.62,0.01 2.04,0.53 0.96,1.14 -0.66,0.16 -0.96,1.27 -0.83,1.91 0.56,0.34 1.32,1.07 0.3,1.41 -0.45,0.2 -0.77,0.79 -1.15,0.77 l 0.02,0.02 0.09,0.08 c 0.01,0.99 0.03,2.01 -0.81,2.72 -0.24,0.86 -0.56,1.72 -0.84,2.56 0.04,0.77 -0.97,1.87 0.28,2.13 -0.18,0.56 -1.24,0.3 -1.41,1.08 -0.6,-0.21 -1.06,-0.37 -1.64,-0.11 -0.94,-0.61 -1.85,0.35 -2.79,0.5 -0.98,-0.3 -0.84,1.37 -1.87,0.99 -0.88,0.49 -2.02,-0.03 -2.53,1.12 -0.65,0.85 -1.78,0.78 -2.65,1.27 -0.36,0 -0.68,0.08 -0.71,-0.1 -0.19,0.39 -0.5,0.76 -0.74,1.13 -0.85,-0.05 -1.05,1.31 -1.84,1.13 -0.48,0 -0.93,0.15 -1.42,-0.12 -0.56,-0.14 -1.85,0.02 -1.28,0.81 -0.47,0.41 -1.19,0.83 -1.88,0.75 -0.95,0.22 -1.5,1.17 -2.22,1.79 -0.78,0.43 -1.17,1.21 -1.93,1.69 -0.48,0.42 -0.85,0.99 -1.45,1.3 -0.02,-0.03 -0.04,-0.06 -0.06,-0.09 0.04,0.16 0.05,0.33 -0.01,0.52 -0.31,0.59 -0.72,1.12 -1.15,1.61 -0.47,0.53 -1.01,0.36 -1.6,0.47 -0.92,0.53 -1.22,1.89 -2.36,2.09 -0.63,0.24 -1.13,0.83 -1.76,1.13 -0.67,0.4 -1.46,0.49 -2.22,0.44 -0.62,-0.09 -0.74,0.55 -1.13,0.84 l 0,0 c -0.07,0.11 -0.22,0.1 -0.33,0.12 -0.73,-0.15 -1.06,0.45 -1.36,1.02 -0.12,0.64 -0.63,0.38 -1.07,0.46 -0.93,0.51 -1.6,1.37 -2.29,2.15 -0.28,0.64 -0.74,0.18 -1.04,-0.17 -0.72,-0.09 -0.38,0.57 -0.25,0.93 -0.34,0.33 -0.55,-0.96 -1.13,-0.58 -0.65,0.22 -1.15,-0.3 -1.69,-0.59 -0.73,-0.51 -0.39,1.2 -1.16,1.07 -0.29,-0.17 -0.22,-0.23 -0.1,-0.31 -0.07,0.02 -0.13,-0.06 -0.18,-0.28 -0.35,-0.79 -1.3,0.1 -1.89,-0.33 -0.79,0.41 -1.43,1.07 -2.2,1.55 -0.68,0.66 -1.75,0.6 -1.98,-0.41 -1.11,-0.18 -1.54,-1.39 -2.23,-2.16 -0.63,-0.68 -1.56,-0.9 -2.45,-0.88 -0.14,0.32 -0.42,1.03 -0.8,0.42 -0.29,-0.87 -0.86,-1.55 -1.8,-1.68 0.04,-0.72 -0.11,-1.76 0.16,-2.53 -0.67,-1.08 1.55,-1.07 0.78,-2.18 -0.27,-0.46 0.6,-0.93 0.79,-1.36 0.26,-0.53 0.8,-0.25 1.12,-0.55 -0.4,-0.62 0.33,-1.49 -0.23,-2.05 -0.38,-0.64 -1.15,-1.11 -1.11,-1.9 -0.28,-0.89 0.5,-1.37 1.24,-1.56 -0.13,-0.09 0.33,-0.14 0.39,-0.3 0.95,-0.18 1.63,-0.93 2.51,-1.28 0.74,-0.61 0.99,1.19 1.61,0.23 0.3,-0.25 0.67,-0.39 1.05,-0.49 -0.87,-0.59 -1.22,-1.56 -1.73,-2.43 -0.32,-0.54 -1.65,-0.04 -1.23,-1.13 -0.43,-0.95 0,-2.2 -0.8,-3.01 -0.48,-0.62 -1.26,-1.96 -0.43,-2.41 0.04,-0.55 0.59,0.2 0.8,-0.42 0.73,-0.57 1.39,0.33 1.93,-0.53 0.64,-0.12 1.22,-0.46 1.77,-0.34 -0.17,-0.14 -0.26,-0.34 -0.2,-0.67 0.01,-0.05 0.02,-0.11 0.03,-0.16 -0.04,0.06 -0.09,0.1 -0.14,0.13 -0.75,-0.27 -1.25,-0.97 -2.02,-1.18 -0.47,-0.47 -1.63,0.35 -1.58,-0.84 -0.13,-1.08 0.35,-1.97 0.45,-3.09 -1.1,-0.54 0.11,-2.65 -1.29,-2.54 -0.43,-0.6 -0.76,-1.07 -1.4,-1.35 -0.41,-0.84 0.2,-1.9 -0.47,-2.66 -0.68,-1.04 1.41,-0.71 1.97,-1.13 0.89,-0.47 2,-1.13 2.65,-1.62 -0.87,-0.42 0.68,-0.46 0.44,-1.25 0.31,-0.46 -0.29,-1.28 0.67,-1.15 0.07,-0.52 0.39,-0.96 0.3,-1.57 0.19,-0.24 0.51,-0.37 0.86,-0.39 -0.24,-0.1 -0.31,-0.27 0,-0.65 0.45,-1.11 0.58,-2.35 -0.33,-3.36 -0.1,-0.63 -0.45,-1.05 -0.81,-1.55 0.87,-0.18 1.68,-1.33 2.46,-0.34 0.94,0.34 1.69,1.76 2.86,1 0.8,-0.54 1.17,-2.34 2.19,-1.03 1,0.74 2.12,1.59 3.28,0.64 0.69,-0.14 1.29,0.01 1.05,-0.89 0.14,-1.05 -1.02,-1.82 -0.95,-2.94 -0.39,-0.61 -1.19,-0.84 -0.64,-1.66 0.18,-0.48 0.19,-1.13 0.26,-1.71 -0.57,-1.08 -1.57,-2.79 0.08,-3.35 0.31,-0.91 1.03,-1.75 1.7,-1.92 -0.33,-0.58 0.47,-1.06 0.78,-1.46 l 0.13,0.08 c -0.41,-0.43 -0.45,-1.16 -0.19,-1.73 0.81,-0.51 -0.88,-1.73 -0.72,-0.5 -0.54,0.83 -1.4,1.26 -1.65,2.25 -0.54,0.68 -0.99,2.01 -2.03,1.19 -0.96,-0.5 -1.94,-0.9 -2.91,-1.39 -0.8,-0.46 -1.3,-1.2 -1.79,-1.93 -0.68,-0.46 -2.12,0.11 -2.11,-0.89 -0.4,-0.29 -0.63,-1.23 0.09,-1.17 0,-0.85 0.57,-2.06 -0.45,-2.49 0.14,-1.14 -1,-0.66 -1.51,-1.16 0.29,-0.73 1.79,-0.3 2.12,-1.31 0.52,-0.06 1.08,-0.07 1.32,-0.75 0.47,-0.96 1.69,-1.08 2.56,-0.7 0.8,0.71 1.83,0.05 2.66,0.7 1.31,0.37 2.38,-0.72 3.27,-1.5 0.26,-0.1 0.52,-0.11 0.75,-0.29 0.89,0.75 1.87,1.07 3.02,1.02 0.73,0.27 1.87,-0.75 2.32,-0.28 -0.02,-0.06 -0.05,-0.12 -0.08,-0.17 0.66,-0.32 1.28,-0.74 2.05,-0.77 1.01,-0.26 1.47,-1.51 2.55,-1.57 0.86,0.13 1.23,-1.15 2.12,-0.67 0.77,0.45 1.6,0.19 2.4,0.29 0.76,0.21 1.1,-0.6 1.09,-1.23 0.01,-0.48 0.91,-0.27 0.75,-0.96 0.18,-0.23 0.36,-0.9 0.49,-0.77 -0.06,-0.38 0.07,-0.76 0.49,-1.04 0.99,-0.25 2.09,0.43 3.12,0.44 0.75,0.4 2.02,1.17 2.09,-0.27 0.43,-1.33 1.47,0.17 2.21,0.28 0.75,0.06 1.58,-0.06 2.25,0.34 0.36,0.11 0.72,0.22 1.08,0.32 z",
  'path-aveiro': "M876.8 113.2l-0.3 0.4 0 0.4-0.4 0.5-0.8 0-0.3 0.1-0.3 0.3-0.2 0.4-0.8 1.1-0.2 0.4-0.3 0.3-0.3 0.2-2.1-0.2-0.2-0.3-0.1-0.3 0-0.4 0.1-0.5 0.3-0.7 0.2-0.3 0.2-0.2 0.1-0.1 0.2-0.2 0.1-0.1 0.1-0.7 0.1-0.3-0.1-0.3-0.4-0.8-0.2-1.0-0.4 0.1-0.6 0.2-0.6 0.4-0.3 0.2-0.3-0.1-0.2-0.4-0.2-0.8 0-0.5 0.2-1.1-1.4-1-0.7 1.2-0.2 0.8-0.3 0.5-1.2-0.2-4-4.1 0-0.1 0.1-0.6 0.7-2.2 0.4-2.8 0.1-0.1 0.2-0.2 0 1 0 0.3 0.7-1.2 0.6-0.4 0.5 0.3 0.2 0 0-0.3-0.1-0.1-0.1-0.3-0.1-0.3 0.1-0.3 0.3-0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.3-0.2 0.3-0.3 0.5-0.8-0.6-0.4-0.3-0.6 0.1-0.5 0.6-0.2 0.9-0.1 0.6-0.2 0.6-0.4 0.6-0.6-0.7 0.1-0.9 0.4-0.7 0.2-0.2 0.1-0.2 0-0.8-0.4-0.3-0.4-0.3-1.3 1.4-1.9-0.3-1.1-0.1 0.8-0.2 0.7-0.3 0.2-0.2-0.7-0.5 1-0.4 1.2-0.2 1.4-0.1 1.2-0.2 0.7-0.4 1.2-0.5 1-0.4 0.5 3.5-16.3 0-1.1 0.3-0.1 1.6-0.2 0.6 0.4 1.1-0.4 0.6-0.4 0.4 0 0.4 0.1 0.3 0.3 0.5 0.3 0.4 0 0.2-0.2 0.3-0.7 0.1-0.2 0.7-0.8 0.7 0.8 0.2 0.3 0.2 0.5 0.7 0.5 0.3 0 0.1-0.2 0-0.3-0.2-0.3 0-0.3 0-0.2 0.9-0.5 0.8 0.3 1.7-1.2 0.1-0.2 0.2-0.5 2.2 1.4 0.1 0.3 0.1 0.5 0 0.3 0 1.1 2.7 1.3 0.4 0 0.5-0.1 0.3-0.6 0.1-0.2 0.1-0.1 0.5-0.4 0.2 0 0.1 0.2 0.1 0.2 0 0.1-0.1 0.1 0 0.2-1.2 1.7-0.1 0.5-0.2 0.6 0.1 0.3 0.1 0.6 0.2 1.3 0.3 0.8 0 0.6-0.2 0.3-0.3 0.1-0.3 0-0.3-0.1-0.3-0.3-0.3-0.1-0.4 0-0.7 0.4-0.4 0-0.4 0-0.3-0.2-1.1 0.1 0.4 1.5-0.1 0.3-0.3 0.5-0.7 1.6-0.9 1-0.8 0.7-0.4 0.6 0 0.2 0 0.2 0.1 0.3 0.1 0.3 0.5 0.6 0.3 0.4 0.1 0.3 0 1.3 0.3 0.7 0.1 0.1 0.7 0.3 0.6 0.5-1.5 0.5-0.2 0.3-0.2 0.3 0 0.4 0.4 1 0.2 0.9 0.2 0.3 0.3 0.2 0.2 0.3 0.4 0.7-2 0.8-0.8 0.7-0.1 0.2 0.1 0.4 0.4 0.6 0 0.6-0.2 0.4-1 1.7 0.1 1.4z",
  'path-beja': "M883.6 209.5l0.2-0.4 2.7 0.1 0.8-0.1 0.5 0.1 0.2 0 0.4 0.5 0.4 0.3 0.3 0.1 0.3 0 0.8-0.4 0.4 0 0.3 0.1 1.1 0.4 0.8 1 3.1 1.4 1.8 0.2 1 0.4 2.3 1.3 0.5 0.1 2.4 0.1 0.7 0.1 0.8 0.3 1.6 0 0.4-0.1 0.1-0.3 0.5-0.7 0.6-0.7 1-0.5 0.1-0.2 0.5-0.3 0.2-0.2 0.3-0.3 0.3-0.4 0.2-0.4 0-0.3 0-0.3 1.2-0.4 1.2-0.6 0.3-0.1 0.2 0 0.9-0.4 0.3 0 0.3 0 0.1 0.2 0 0.1 0.1 0.3 0 0.1 0.2 0.2 0.2 0.3 0.1 0.3 0.1 0.4 0.1 0.3 0.1 0.3 0.8 0.8 0.9 0.4 0.2 0.2 0.1 0.3 0.1 0.4 0.4 0.9 0.1 0.3 0.3 0.7 0.3 0.3 0.4 0.3 0.6 0.1 0.3-0.1 0.3-0.2 0.1-0.1 0.5 0.5 0.6 0 0.9-0.2 0.9-0.4 0.4-0.6 0.2 0 0.1 0.1 0.9-0.3 1.1-0.1 0.5 0.3 0.1 0.1-0.4 1.3-0.3 0.7-0.5 1.6-0.7 1.3-0.3 1.4-0.3 0.6-0.3 1.1-0.9 0.1-2.1-0.8-0.6-0.1-0.3 0.4-0.4 0.9-0.4 0.5-0.2 0.2-0.5 0.2-0.5 0.2-0.4-0.1-0.5-0.1-0.4 0-0.4 0.2-1.2 0.3-0.2 0.2 0 0.4 0.1 0.4 0 0.5-0.2 0.8-0.8 2.2-0.4 1.5-1 1.8-3.3 2.8-0.6 1-0.5 1.3-0.3 2.2-0.2 0.7-0.3 0.4-0.9 1-0.4 0.3 0.1 0.2 0 0.3-0.1 0.2 0 0.2-0.4 0.4-0.1 0.2 0 0.5 0 0.1 0.2 0 0.2 0.6 0 0.3 0.1 0.3-0.9 0.2-1 0-0.8 0.4-0.7 0.7-0.4 0.2-0.3 0.1-0.2-0.1-0.6-0.1-0.2-0.1-1.9 0-2.8 1.2-0.7 0.4-0.2 0.2-0.2 0.1-0.2 0-0.7 0.4-0.3 0.1-0.2 0.1-0.1 0.3-0.5 0.1-0.6 0.4-0.1 0.3-0.2 0.3-0.5 0.2-1 0.2-0.5 0-1.1 0.2-0.5 0.3-0.2 0.3 0 0.3 0.1 0.2 0.2 0.4 0 0.2-0.2 0.1-1.3 0.7-0.8 0.7-0.5 0.2-0.4 0-1.4-0.1-0.7 0-1.2-0.4-2.5-1.9-0.6-0.3-0.4-0.5-0.1-0.2-0.1-0.7-0.3-0.5-0.9-0.3-0.6 0.1-0.3 0.2-0.4-0.1-0.4 0.1-0.8 0.1-1.4 0.5-0.1 0.2-0.3 0.3 0 0.3-0.2 0.4-0.6 0.3-0.7 0.3-1.5-0.3-0.6-0.2-1.4-0.8-0.4-0.1-1.4 0.2-0.3 0.2-0.2 0.2-0.2 0.2-0.2 0.2-0.3-0.1-0.2-0.1-1-0.5-1.5-0.1-0.2-0.1-0.4-0.3-0.3-0.4-0.6-0.5-0.5-0.1-0.7-0.5-0.5-0.3 0.2-0.6 0.2-1.2 0.1-2.1-0.2-1.1-0.4-0.7-0.5-0.6 0-0.6 0.4-2 0.2-1.3 0.3-1.1 0.5-0.3 1-0.2 0.2-1.1 0-0.1-0.3 0.3-0.8 0.2-0.9 0-0.3-0.8 0.3-2.3 0.3-1.7 0.3 0.4 0.2 0.3 0.2 0.1 0.3 0 0.2-0.1 0.3-0.2 0.3-0.1 0.6 0.2 0.3 0.4 0.1 0.2 0.9 1.2 0.4 0.6 0.1 0.2 0.2 0 0.2-0.2 0.1-0.3 0.2-0.1 0.3 0.1 0.3 0.1 0.3 0.3 0.6 0.2 0.4 0.1 0.6-0.3 0.2-0.3 0.1-0.3 0-0.4 0.4-1 0.1-0.3 0.7-0.7 0.1-0.3 0.1-0.4 0.4-0.3 0.6-0.3 3.2-0.6 1.6 0.3 1 0 0.1 0 1.1 0.6 0.5-1.3 0.2-0.3 0.4-1.2 0.2-2.1 0-1.3-0.4-1-0.2-0.4-0.5-0.4-0.5 0-0.4-0.1-0.4-0.3-0.6-0.6-0.7-0.6-0.1-0.4-0.1-0.3 0-0.2 0.1-0.3 0-0.3 0.1-0.3 0.1-0.3 0.2-0.4 0.3 0 0.2 0.1 0.2 0 0.2 0 0.1-0.2 0.1-0.1 0.1-0.5 0.1-0.2 0-0.2 0-0.2 0.1-0.2 0.3-0.1 0.2-0.2 0.2-0.1 0.4 0.2 0.3 0.2 0.2 0.1 0.3-0.2 0.2-0.8 0.1-0.4 0.1-0.2 0.3-0.2 1.3 0 0.2-0.4 0.1-0.5 0.3-0.1 1.3-0.3 0.6-0.3 1.3-0.4 0.2-0.5 0-0.3 0-0.5-0.3-1.1-0.9-2z",
};

export default function MapPage() {
  const { t } = useTranslation();
  const [activeIndicator, setActiveIndicator] = useState<IndicatorKey>('salary');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);

  const getDistrictFill = (id: string) => {
    const data = DISTRICT_DATA_2026.find(d => d.id === id);
    if (!data) return '#f0f0f0';
    
    const values = DISTRICT_DATA_2026.map(d => d[activeIndicator]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = data[activeIndicator];
    
    const isReversed = activeIndicator === 'poverty';
    const ratio = (max === min) ? 0.5 : (current - min) / (max - min);
    const finalRatio = isReversed ? 1 - ratio : ratio;
    
    const opacity = 0.2 + (finalRatio * 0.8);
    return `hsl(217 91% 60% / ${opacity})`;
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
              <Badge variant="outline" className="bg-background/50">ATLAS 2026</Badge>
            </CardHeader>
            <CardContent className="p-4 flex justify-center items-center min-h-[600px]">
              <svg width="100%" height="100%" viewBox="0 0 1000 600" className="max-h-[700px]" xmlns="http://www.w3.org/2000/svg">
                <g id="g-districts" transform="translate(50, 20)">
                  {Object.entries(MAP_PATHS).map(([id, path]) => (
                    <path
                      key={id}
                      id={id}
                      d={path}
                      style={{ fill: getDistrictFill(id), stroke: '#ffffff', strokeWidth: 0.5 }}
                      className="cursor-pointer hover:stroke-primary hover:stroke-2 transition-all"
                      onClick={() => {
                        const d = DISTRICT_DATA_2026.find(item => item.id === id);
                        if (d) setSelectedDistrict(d);
                      }}
                    />
                  ))}
                </g>
              </svg>

              <div className="absolute bottom-6 right-6 p-4 bg-background/90 backdrop-blur-md rounded-2xl border shadow-lg space-y-3 min-w-[180px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('map.legend')}</p>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-gradient-to-r from-primary/10 to-primary shadow-inner" />
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
                <p className="text-sm font-medium">Selecione uma região no mapa.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
