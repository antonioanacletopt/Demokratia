'use server';

import {
  simulateEconomicPolicy,
  EconomicPolicySimulationInput,
  EconomicPolicySimulationOutput,
} from '@/ai/flows/simulate-economic-policy';
import {
  explainPublicDataInsights,
  ExplainPublicDataInsightsInput,
  ExplainPublicDataInsightsOutput,
} from '@/ai/flows/explain-public-data-insights';
import {
  findPublicStatistic,
  FindPublicStatisticInput,
  FindPublicStatisticOutput,
} from '@/ai/flows/find-public-statistic';
import {
  generateChartFromRequest,
  GenerateChartInput,
  GenerateChartOutput,
} from '@/ai/flows/generate-chart-from-request';
import {
  factCheckClaim,
  FactCheckInput,
  FactCheckOutput,
} from '@/ai/flows/fact-check-claim';
import {
  consultLegislation,
  ConsultLegislationInput,
  ConsultLegislationOutput,
} from '@/ai/flows/consult-legislation';
import {
  generateNewsFeed,
  GenerateNewsFeedOutput,
} from '@/ai/flows/generate-news-feed';

import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Language } from './i18n';

export async function getEconomicSimulation(
  input: Omit<EconomicPolicySimulationInput, 'language'>,
  lang: Language
): Promise<EconomicPolicySimulationOutput> {
  const language = lang === 'en' ? 'English' : 'Portuguese';
  return await simulateEconomicPolicy({ ...input, language });
}

export async function getFactCheck(
  input: Omit<FactCheckInput, 'language'>,
  lang: Language
): Promise<FactCheckOutput> {
  const language = lang === 'en' ? 'English' : 'Portuguese';
  return await factCheckClaim({ ...input, language });
}

export async function getLegislationInfo(
  input: Omit<ConsultLegislationInput, 'language'>,
  lang: Language
): Promise<ConsultLegislationOutput> {
  // Update legislation flow if needed to accept language, currently it simulates PT law
  return await consultLegislation({ ...input } as any);
}

export async function getDataExplanation(
  input: ExplainPublicDataInsightsInput
): Promise<ExplainPublicDataInsightsOutput> {
  return await explainPublicDataInsights(input);
}

export async function getPublicStatistic(
  input: FindPublicStatisticInput
): Promise<FindPublicStatisticOutput> {
  return await findPublicStatistic(input);
}

export async function getChartFromRequest(
  input: GenerateChartInput
): Promise<GenerateChartOutput> {
  return await generateChartFromRequest(input);
}

export async function getNewsFeed(): Promise<GenerateNewsFeedOutput> {
  return await generateNewsFeed();
}
