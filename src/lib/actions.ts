
'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Language } from './i18n';
import pt from './i18n/pt.json';
import en from './i18n/en.json';

import * as schema from './actions-schema';

// Tipos de tradução para acesso seguro
type TranslationObject = typeof pt.actions;

const translations = {
  pt: pt.actions as TranslationObject,
  en: en.actions as TranslationObject,
};

// Função para obter a tradução correta
function getT(lang: Language) {
  const langKey = lang in translations ? lang : 'pt';
  const t = translations[langKey];

  return function translate(key: string, replacements?: { [key: string]: string }): string {
    const keyParts = key.split('.');
    let value: any = t;
    for (const part of keyParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return key; // Retorna a chave se não encontrar a tradução
      }
    }

    if (typeof value === 'string' && replacements) {
      return Object.entries(replacements).reduce((acc, [k, v]) => acc.replace(`{{${k}}}`, v), value);
    }

    return typeof value === 'string' ? value : key;
  };
}

export type ConsultLegislationInput = z.infer<typeof schema.consultLegislationInputSchema>;
export type ConsultLegislationOutput = z.infer<typeof schema.consultLegislationOutputSchema>;
export type SimulationResult = z.infer<typeof schema.simulationResultSchema>;
export type DataExplorerResult = z.infer<typeof schema.dataExplorerResultSchema>;
export type ScenarioInput = z.infer<typeof schema.scenarioInputSchema>;
export type ScenarioAnalysisResult = z.infer<typeof schema.scenarioAnalysisResultSchema>;
export type IRSAssessmentInput = z.infer<typeof schema.irsAssessmentInputSchema>;
export type IRSAssessmentOutput = z.infer<typeof schema.irsAssessmentOutputSchema>;
export type NewsFeedItem = z.infer<typeof schema.newsFeedItemSchema>;
export type NewsFeedOutput = z.infer<typeof schema.newsFeedOutputSchema>;
export type PublicStatisticOutput = z.infer<typeof schema.publicStatisticSchema>;
export type ChartOutput = z.infer<typeof schema.chartOutputSchema>;
export type FamilyBudgetInput = z.infer<typeof schema.familyBudgetInputSchema>;
export type FamilyBudgetAnalysis = z.infer<typeof schema.familyBudgetAnalysisSchema>;
export type MarketAnalysisInput = z.infer<typeof schema.marketAnalysisInputSchema>;
export type MarketAnalysisOutput = z.infer<typeof schema.marketAnalysisOutputSchema>;
export type FactCheckInput = z.infer<typeof schema.factCheckInputSchema>;
export type FactCheckOutput = z.infer<typeof schema.factCheckOutputSchema>;

enableFirebaseTelemetry();

// 1. Ativação de telemetria e injeção de contexto do Firebase.
const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
  ],
});

// Tier definitions based on capability and speed
const MODELS = {
  capable: [
    googleAI.model('gemini-2.5-pro'),         // Most capable (March 2026)
    googleAI.model('gemini-2.0-flash-001'),    // Stable versioned flash
    googleAI.model('gemini-1.5-pro-002'),      // Legacy pro fallback
  ],
  fast: [
    googleAI.model('gemini-2.5-flash'),        // Fast + smart (March 2026)
    googleAI.model('gemini-2.0-flash-001'),    // Stable versioned flash
    googleAI.model('gemini-1.5-flash-002'),    // Legacy flash fallback
  ]
};

// Compatible aliases for existing code if needed, but we'll use tiers
const capableModel = MODELS.capable[0];
const fastModel = MODELS.fast[0];

function cleanAndParseJson<T>(jsonString: string, t: Function): T {
  const cleanedString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleanedString) as T;
  } catch (error) {
    console.error(t('errors.jsonParseFail', { json: cleanedString }));
    throw new Error(t('errors.invalidJSON'));
  }
}

async function safeGenerate(tier: 'capable' | 'fast', prompt: string, t: Function, additionalOptions: any = {}): Promise<{ text: string }> {
  if (process.env.NEXT_PUBLIC_AI_QUOTA_EXHAUSTED === 'true') {
    throw new Error(t('common.aiUnavailableError'));
  }

  const modelStack = MODELS[tier];
  let lastError: any = null;

  for (const model of modelStack) {
    try {
      const response = await ai.generate({
        model,
        prompt,
        ...additionalOptions
      });
      return response as { text: string };
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || "";
      
      // If it's a quota or overload error, we try the next model in the stack
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('overloaded') || errorMsg.includes('503')) {
        console.warn(`AI Fallback triggered: Model failed, trying next in tier ${tier}...`, errorMsg);
        continue;
      }
      
      // For other types of errors (e.g. invalid prompt), we might want to stop
      break;
    }
  }

  const errMsg = lastError?.message || String(lastError);
  console.error(`AI Generation failed after exhausting tier ${tier}. Last error: ${errMsg}`, lastError);
  throw new Error(t('common.aiUnavailableError'));
}


export async function getLegislationInfo(input: ConsultLegislationInput, lang: Language): Promise<ConsultLegislationOutput> {
    const t = getT(lang);
    const systemPrompt = `
      ${t('prompts.expertInLaw')}
      ${t('instructions.analysisLang', { lang })}
      ${t('instructions.userQuestion', { question: input.question })}
      ${t('instructions.jsonOutput')}
      \`\`\`json
      ${JSON.stringify(zodToJsonSchema(schema.consultLegislationOutputSchema))}
      \`\`\`
      ${t('instructions.jsonOnly')}
    `;
    const { text } = await safeGenerate('capable', systemPrompt, t);
    if (!text) throw new Error(t('errors.noResponseFor', { context: t('context.legislation') }));
    const result = cleanAndParseJson<ConsultLegislationOutput>(text, t);
    const validation = schema.consultLegislationOutputSchema.safeParse(result);
    if (!validation.success) {
      console.error(t('errors.zodValidationFailed', { error: validation.error.toString() }));
      throw new Error(t('errors.schemaMismatchFor', { context: t('context.legislation') }));
    }
    return validation.data;
}

export async function getFactCheck(input: FactCheckInput, lang: Language): Promise<FactCheckOutput> {
    const t = getT(lang);
    const systemPrompt = `
      ${t('prompts.factChecker')}
      ${t('instructions.analysisLang', { lang })}
      ${t('instructions.claimToVerify', { claim: input.claim })}
      ${t('instructions.todayIs', { date: new Date().toLocaleDateString(lang) })}
      ${t('instructions.jsonOutput')}
      \`\`\`json
      ${JSON.stringify(zodToJsonSchema(schema.factCheckOutputSchema))}
      \`\`\`
      ${t('instructions.jsonOnly')}
    `;
    const { text } = await safeGenerate('capable', systemPrompt, t);
    if (!text) throw new Error(t('errors.noResponseFor', { context: t('context.factCheck') }));
    const result = cleanAndParseJson<FactCheckOutput>(text, t);
    const validation = schema.factCheckOutputSchema.safeParse(result);
    if (!validation.success) {
      console.error(t('errors.zodValidationFailed', { error: validation.error.toString() }));
      throw new Error(t('errors.schemaMismatchFor', { context: t('context.factCheck') }));
    }
    return validation.data;
}

export async function getScenarioAnalysis(input: ScenarioInput, lang: Language): Promise<ScenarioAnalysisResult> {
    const t = getT(lang);
    const systemPrompt = `
      ${t('prompts.analyst')}
      ${t('instructions.analysisLang', { lang })}
      ${t('instructions.scenarioToAnalyze', { scenario: JSON.stringify(input, null, 2) })}
      ${t('instructions.jsonOutput')}
      \`\`\`json
      ${JSON.stringify(zodToJsonSchema(schema.scenarioAnalysisResultSchema))}
      \`\`\`
      ${t('instructions.jsonOnly')}
    `;
    const { text } = await safeGenerate('capable', systemPrompt, t);
    if (!text) throw new Error(t('errors.noResponseFor', { context: t('context.scenario') }));
    const result = cleanAndParseJson<ScenarioAnalysisResult>(text, t);
    const validation = schema.scenarioAnalysisResultSchema.safeParse(result);
    if (!validation.success) {
      console.error(t('errors.zodValidationFailed', { error: validation.error.toString() }));
      throw new Error(t('errors.schemaMismatchFor', { context: t('context.scenario') }));
    }
    return validation.data;
}

// Cache de servidor: gerado 1x e reutilizado por todos os utilizadores durante 6 horas.
// Evita chamadas repetidas à IA a cada visita.
const getCachedNewsFeed = unstable_cache(
  async (): Promise<NewsFeedOutput> => {
    const t = getT('pt');
    const systemPrompt = `
    ${t('prompts.newsAnalyst')}
    ${t('instructions.newsFeedTask')}
    ${t('instructions.newsFeedDate', { date: new Date().toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' }) })}
    ${t('instructions.jsonOutput')}
    \`\`\`json
    ${JSON.stringify(zodToJsonSchema(schema.newsFeedOutputSchema))}
    \`\`\`
    ${t('instructions.jsonOnly')}
  `;
    const { text } = await safeGenerate('fast', systemPrompt, t);
    if (!text) throw new Error(t('errors.noResponseFor', { context: t('context.newsFeed') }));
    const result = cleanAndParseJson<NewsFeedOutput>(text, t);
    const validation = schema.newsFeedOutputSchema.safeParse(result);
    if (!validation.success) {
      console.error(t('errors.zodValidationFailed', { error: validation.error.toString() }));
      throw new Error(t('errors.schemaMismatchFor', { context: t('context.newsFeed') }));
    }
    // Sanitize actionLink hrefs: only allow known internal routes to prevent 404s
    const ALLOWED_HREF_PREFIXES = ['/simulations?', '/fact-check?'];
    const sanitizedData = {
      ...validation.data,
      feedItems: validation.data.feedItems.map(item => {
        if (item.actionLink && !ALLOWED_HREF_PREFIXES.some(prefix => item.actionLink!.href.startsWith(prefix))) {
          console.warn(`[getNewsFeed] Stripped invalid actionLink href: ${item.actionLink.href}`);
          const { actionLink: _, ...rest } = item;
          return rest;
        }
        return item;
      }),
    };
    return sanitizedData;
  },
  ['news-feed'],
  { revalidate: 6 * 60 * 60 } // 6 horas — partilhado entre todos os utilizadores
);

export async function getNewsFeed(): Promise<NewsFeedOutput> {
  return getCachedNewsFeed();
}

export async function getTranslation(text: string, targetLanguage: Language): Promise<string> {
  if (targetLanguage === 'pt') return text;
  const t = getT(targetLanguage);
  const systemPrompt = `
    ${t('prompts.translator')}
    ${t('instructions.translateTo', { lang: targetLanguage })}
    ${t('instructions.textOnly')}
    ${t('instructions.textToTranslate', { text })}
  `;
  const { text: translatedText } = await safeGenerate('fast', systemPrompt, t, { output: { format: 'text' } });
  if (!translatedText) throw new Error(t('errors.translationFailed'));
  return translatedText.trim();
}

export async function getEconomicSimulation(policy: string, lang: Language): Promise<SimulationResult> {
  const t = getT(lang);
  const systemPrompt = `
    ${t('prompts.analyst')}
    ${t('instructions.analysisLang', { lang })}
    ${t('instructions.policyToAnalyze', { policy })}
    ${t('instructions.jsonOutput')}
    \`\`\`json
    ${JSON.stringify(zodToJsonSchema(schema.simulationResultSchema))}
    \`\`\`
    ${t('instructions.jsonOnly')}
  `;
  const { text } = await safeGenerate('capable', systemPrompt, t);
  if (!text) throw new Error(t('errors.noResponseFor', { context: t('context.simulation') }));
  const result = cleanAndParseJson<SimulationResult>(text, t);
  const validation = schema.simulationResultSchema.safeParse(result);
  if (!validation.success) {
    console.error(t('errors.zodValidationFailed', { error: validation.error.toString() }));
    throw new Error(t('errors.schemaMismatchFor', { context: t('context.simulation') }));
  }
  return validation.data;
}

export async function getIRSAssessment(input: IRSAssessmentInput, lang: Language): Promise<IRSAssessmentOutput> {
  const t = getT(lang);
  const systemPrompt = `
    ${t('prompts.taxExpert')}
    ${t('instructions.analysisLang', { lang })}
    ${t('instructions.userInput', { input: JSON.stringify(input, null, 2) })}
    ${t('instructions.jsonOutput')}
    \`\`\`json
    ${JSON.stringify(zodToJsonSchema(schema.irsAssessmentOutputSchema))}
    \`\`\`
    ${t('instructions.jsonOnly')}
  `;
  const { text } = await safeGenerate('capable', systemPrompt, t);
  if (!text) throw new Error(t('errors.noResponseFor', { context: t('context.irs') }));
  const result = cleanAndParseJson<IRSAssessmentOutput>(text, t);
  const validation = schema.irsAssessmentOutputSchema.safeParse(result);
  if (!validation.success) {
    console.error(t('errors.zodValidationFailed', { error: validation.error.toString() }));
    throw new Error(t('errors.schemaMismatchFor', { context: t('context.irs') }));
  }
  return validation.data;
}

export async function getPublicStatistic(input: { request: string }, lang: Language): Promise<PublicStatisticOutput> {
  const t = getT(lang);
  const systemPrompt = `
    ${t('prompts.dataRetriever')}
    ${t('instructions.userRequest', { request: input.request })}
    ${t('instructions.findData')}
    ${t('instructions.dataNotFound')}
    ${t('instructions.jsonOutput')}
    \`\`\`json
    ${JSON.stringify(zodToJsonSchema(schema.publicStatisticSchema))}
    \`\`\`
    ${t('instructions.jsonOnly')}
  `;
  const { text } = await safeGenerate('fast', systemPrompt, t);
  if (!text) throw new Error(t('errors.noResponseFor', { context: t('context.publicStats') }));
  const result = cleanAndParseJson<PublicStatisticOutput>(text, t);
  const validation = schema.publicStatisticSchema.safeParse(result);
  if (!validation.success) {
    console.error(t('errors.zodValidationFailed', { error: validation.error.toString() }));
    throw new Error(t('errors.schemaMismatchFor', { context: t('context.publicStats') }));
  }
  return validation.data;
}

export async function getChartFromRequest(input: { request: string }, lang: Language): Promise<ChartOutput> {
  const t = getT(lang);
  const systemPrompt = `
    ${t('prompts.dataVisualizer')}
    ${t('instructions.userRequest', { request: input.request })}
    ${t('instructions.chartable')}
    ${t('instructions.notChartable')}
    ${t('instructions.jsonOutput')}
    \`\`\`json
    ${JSON.stringify(zodToJsonSchema(schema.chartOutputSchema))}
    \`\`\`
    ${t('instructions.jsonOnly')}
  `;
  const { text } = await safeGenerate('fast', systemPrompt, t);
  if (!text) throw new Error(t('errors.noResponseFor', { context: t('context.chartRequest') }));
  const result = cleanAndParseJson<ChartOutput>(text, t);
  const validation = schema.chartOutputSchema.safeParse(result);
  if (!validation.success) {
    console.error(t('errors.zodValidationFailed', { error: validation.error.toString() }));
    throw new Error(t('errors.schemaMismatchFor', { context: t('context.chartRequest') }));
  }
  return validation.data;
}

export async function getFamilyBudgetAnalysis(input: FamilyBudgetInput, lang: Language): Promise<FamilyBudgetAnalysis> {
  const t = getT(lang);
  const systemPrompt = `
    ${t('prompts.financialAdvisor')}
    ${t('instructions.analysisLang', { lang })}
    ${t('instructions.userInput', { input: JSON.stringify(input, null, 2) })}
    ${t('instructions.jsonOutput')}
    \`\`\`json
    ${JSON.stringify(zodToJsonSchema(schema.familyBudgetAnalysisSchema))}
    \`\`\`
    ${t('instructions.jsonOnly')}
  `;
  const { text } = await safeGenerate('capable', systemPrompt, t);
  if (!text) throw new Error(t('errors.noResponseFor', { context: t('context.budget') }));
  const result = cleanAndParseJson<FamilyBudgetAnalysis>(text, t);
  const validation = schema.familyBudgetAnalysisSchema.safeParse(result);
  if (!validation.success) {
    console.error(t('errors.zodValidationFailed', { error: validation.error.toString() }));
    throw new Error(t('errors.schemaMismatchFor', { context: t('context.budget') }));
  }
  return validation.data;
}

export async function getMarketAnalysis(input: MarketAnalysisInput, lang: Language): Promise<MarketAnalysisOutput> {
  const t = getT(lang);
  const systemPrompt = `
    ${t('prompts.investmentAnalyst')}
    ${t('instructions.analysisLang', { lang })}
    ${t('instructions.userInput', { input: JSON.stringify(input, null, 2) })}
    ${t('instructions.jsonOutput')}
    \`\`\`json
    ${JSON.stringify(zodToJsonSchema(schema.marketAnalysisOutputSchema))}
    \`\`\`
    ${t('instructions.jsonOnly')}
  `;
  const { text } = await safeGenerate('capable', systemPrompt, t);
  if (!text) throw new Error(t('errors.noResponseFor', { context: t('context.market') }));
  const result = cleanAndParseJson<MarketAnalysisOutput>(text, t);
  const validation = schema.marketAnalysisOutputSchema.safeParse(result);
  if (!validation.success) {
    console.error(t('errors.zodValidationFailed', { error: validation.error.toString() }));
    throw new Error(t('errors.schemaMismatchFor', { context: t('context.market') }));
  }
  return validation.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inflation data — fetches from Eurostat HICP API, cached 12h server-side
// ─────────────────────────────────────────────────────────────────────────────

import { BASELINE_DATA, EUROSTAT_COICOPS, type InflationData } from './inflation-data';

async function fetchEurostatInflation(): Promise<InflationData> {
  try {
    const coicopParams = EUROSTAT_COICOPS.map(c => `coicop=${c}`).join('&');
    const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_manr?format=JSON&lang=en&geo=PT&unit=RCH_A&${coicopParams}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return BASELINE_DATA;

    const json = await response.json();
    const timeDim = json.dimension?.TIME_PERIOD?.category;
    const coicopDim = json.dimension?.coicop?.category;
    if (!timeDim || !coicopDim) return BASELINE_DATA;

    const timeKeys: string[] = Object.keys(timeDim.index).sort();
    const N = timeKeys.length;
    const values: (number | null)[] = json.value;

    const rates: Record<string, number> = {};
    let latestPeriod = '';

    for (const coicop of EUROSTAT_COICOPS) {
      const coicopIdx: number | undefined = coicopDim.index[coicop];
      if (coicopIdx === undefined) continue;
      for (let t = N - 1; t >= 0; t--) {
        const val = values[coicopIdx * N + t];
        if (val !== null && val !== undefined) {
          rates[coicop] = val;
          if (coicop === 'CP00') latestPeriod = timeKeys[t];
          break;
        }
      }
    }

    if (!rates['CP00'] || !latestPeriod) return BASELINE_DATA;

    const [year, month] = latestPeriod.split('-');
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const periodLabel = `${months[parseInt(month) - 1]} ${year}`;

    return {
      ...BASELINE_DATA,
      overall: rates['CP00'],
      period: latestPeriod,
      periodLabel,
      source: 'Eurostat HICP (live)',
      isLive: true,
      updatedAt: new Date().toISOString(),
      categories: BASELINE_DATA.categories.map(cat => ({
        ...cat,
        rate: rates[cat.coicop] ?? cat.rate,
      })),
    };
  } catch {
    return BASELINE_DATA;
  }
}

const getCachedInflationData = unstable_cache(
  fetchEurostatInflation,
  ['inflation-data'],
  { revalidate: 12 * 60 * 60 } // 12 hours
);

export async function getInflationData(): Promise<InflationData> {
  return getCachedInflationData();
}

