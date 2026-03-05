'use server';

/**
 * @fileOverview O Cérebro Único da Demokratia.
 * Centraliza todas as Server Actions e integração com Genkit v1.x.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { Language } from './i18n';
import { 
  FactCheckOutputSchema, 
  EconomicSimulationOutputSchema,
  LegislationOutputSchema,
  ScenarioAnalysisOutputSchema,
  IRSAssessmentOutputSchema,
  FamilyBudgetOutputSchema,
  MarketAnalysisOutputSchema,
  NewsFeedOutputSchema,
  ChartOutputSchema
} from './actions-schema';

const ai = genkit({
  plugins: [googleAI()],
});

const MODEL_ID = 'googleai/gemini-1.5-flash';

export async function getTranslation(text: string, lang: Language) {
  const target = lang === 'en' ? 'English' : 'Portuguese';
  const { text: translated } = await ai.generate({
    model: MODEL_ID,
    prompt: `Translate the following text to ${target}. Maintain the tone and technical terms: ${text}`,
  });
  return translated;
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `Analyze the economic impact of: "${input.policyDescription}" in Portugal 2026. Return as JSON.`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(text);
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `Fact-check this regarding Portugal: "${input.claim}". Use official sources. Return as JSON.`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(text);
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `Answer this legal question about Portugal using DRE sources: "${input.question}". Return as JSON.`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(text);
}

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `Analyze this macroeconomic scenario for Portugal 2026: ${JSON.stringify(input)}. Return as JSON.`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(text);
}

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `As a Portuguese tax expert, analyze these IRS parameters for 2026: ${JSON.stringify(input)}. Return as JSON.`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(text);
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `Analyze this family budget for Portugal 2026: ${JSON.stringify(input)}. Return as JSON.`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(text);
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `Provide a strategic market briefing for Portugal in 2026. Return as JSON.`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(text);
}

export async function getNewsFeed() {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `Generate 5 relevant news feed items for Portugal in 2026. Return as JSON.`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(text);
}

export async function getChartFromRequest(input: { request: string }) {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `Extract statistical data for: "${input.request}" in Portugal. Return as JSON.`,
    config: { responseMimeType: 'application/json' },
  });
  return JSON.parse(text);
}

export async function getPublicStatistic(input: { request: string }) {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `Find raw statistical data for: "${input.request}". Return JSON with 'data' stringified and 'explanation'.`,
    config: { responseMimeType: 'application/json' },
  });
  const parsed = JSON.parse(text);
  return {
    isFound: !!parsed.data,
    data: typeof parsed.data === 'string' ? parsed.data : JSON.stringify(parsed.data),
    explanation: parsed.explanation || '',
    source: parsed.source || 'Fontes Oficiais',
  };
}
