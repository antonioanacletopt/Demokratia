'use server';

import {
  simulateEconomicPolicy,
  EconomicPolicySimulationInput,
  EconomicPolicySimulationOutput,
} from '@/ai/flows/simulate-economic-policy';
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
import {
  translateContent,
} from '@/ai/flows/translate-content';
import {
  generateChartFromRequest,
  GenerateChartInput,
  GenerateChartOutput,
} from '@/ai/flows/generate-chart-from-request';
import {
  findPublicStatistic,
  FindPublicStatisticInput,
  FindPublicStatisticOutput,
} from '@/ai/flows/find-public-statistic';

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
  const language = lang === 'en' ? 'English' : 'Portuguese';
  return await consultLegislation({ ...input, language });
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

/**
 * AI-powered translation. 
 * Note: Cache checking and saving has been moved to the client side 
 * to comply with Firebase environment constraints.
 */
export async function getTranslation(
  text: string,
  lang: Language
): Promise<string> {
  if (!text || text.trim().length === 0) return '';
  if (lang === 'pt') return text;
  
  const targetLanguage = lang === 'en' ? 'English' : 'Portuguese';
  const result = await translateContent({ text, targetLanguage });
  return result.translatedText;
}
