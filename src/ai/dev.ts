'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/explain-public-data-insights.ts';
import '@/ai/flows/simulate-economic-policy.ts';
import '@/ai/flows/find-public-statistic.ts';
import '@/ai/flows/generate-chart-from-request.ts';
import '@/ai/flows/fact-check-claim.ts';
import '@/ai/flows/consult-legislation.ts';
import '@/ai/flows/generate-news-feed.ts';
import '@/ai/flows/translate-content.ts';
import '@/ai/flows/explain-scenario-impact.ts';
import '@/ai/flows/analyze-family-budget.ts';
import '@/ai/flows/calculate-irs-flow.ts';
