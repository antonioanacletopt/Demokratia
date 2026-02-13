'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/explain-public-data-insights.ts';
import '@/ai/flows/simulate-economic-policy.ts';
import '@/ai/flows/find-public-statistic.ts';
import '@/ai/flows/generate-chart-from-request.ts';
