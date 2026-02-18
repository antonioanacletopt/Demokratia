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

import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore';
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
  return await consultLegislation({ ...input } as any);
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
 * AI-powered translation with Firestore caching.
 * allowAI: if false, only returns cached version or null.
 */
export async function getTranslation(
  text: string,
  lang: Language,
  allowAI: boolean = true
): Promise<string | null> {
  if (!text || text.trim().length === 0) return '';
  if (lang === 'pt') return text; // Default language is already Portuguese
  
  const targetLanguage = lang === 'en' ? 'English' : 'Portuguese';
  const { firestore } = initializeFirebase();
  const cacheRef = collection(firestore, 'translations_cache');
  
  try {
    // 1. Check cache first
    const q = query(
      cacheRef, 
      where('originalText', '==', text), 
      where('targetLanguage', '==', targetLanguage),
      limit(1)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data().translatedText;
    }

    if (!allowAI) return null;

    // 2. If not in cache and AI allowed, call AI
    const result = await translateContent({ text, targetLanguage });
    const translatedText = result.translatedText;

    // 3. Save to cache for others
    await addDoc(cacheRef, {
      originalText: text,
      translatedText,
      targetLanguage,
      createdAt: serverTimestamp()
    });

    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return allowAI ? text : null; // Fallback to original if AI allowed, else null
  }
}
