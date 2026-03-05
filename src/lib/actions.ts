
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

// Inicialização centralizada do Genkit com o plugin Google AI
const ai = genkit({
  plugins: [googleAI()],
});

// Identificador de modelo estável para Genkit 1.x
const MODEL_ID = 'googleai/gemini-1.5-flash';

/**
 * Tradução de texto mantendo o tom técnico.
 */
export async function getTranslation(text: string, lang: Language) {
  const target = lang === 'en' ? 'English' : 'Portuguese';
  const { text: translated } = await ai.generate({
    model: MODEL_ID,
    prompt: `Translate the following text to ${target}. Maintain the tone and technical terms: ${text}`,
  });
  return translated;
}

/**
 * Simulação de impacto económico de propostas.
 */
export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Analyze the economic impact of: "${input.policyDescription}" in Portugal 2026. Language: ${lang === 'en' ? 'English' : 'Portuguese'}. Return as JSON.`,
    output: { schema: EconomicSimulationOutputSchema }
  });
  return output!;
}

/**
 * Verificação de factos com base em fontes oficiais.
 */
export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Fact-check this regarding Portugal: "${input.claim}". Language: ${lang === 'en' ? 'English' : 'Portuguese'}. Use official sources like INE and Pordata. Return as JSON.`,
    output: { schema: FactCheckOutputSchema }
  });
  return output!;
}

/**
 * Consulta de legislação do Diário da República.
 */
export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Answer this legal question about Portugal using DRE (Diário da República) sources: "${input.question}". Language: ${lang === 'en' ? 'English' : 'Portuguese'}. Return as JSON.`,
    output: { schema: LegislationOutputSchema }
  });
  return output!;
}

/**
 * Análise de cenários macroeconómicos do Laboratório.
 */
export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Analyze this macroeconomic scenario for Portugal 2026: ${JSON.stringify(input)}. Provide technical feedback on the impact on GDP and debt. Language: ${lang === 'en' ? 'English' : 'Portuguese'}. Return as JSON.`,
    output: { schema: ScenarioAnalysisOutputSchema }
  });
  return output!;
}

/**
 * Avaliação técnica de IRS para 2026.
 */
export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `As a Portuguese tax expert, analyze these IRS parameters for 2026 based on official tax rules: ${JSON.stringify(input)}. Provide tips for optimization. Language: ${lang === 'en' ? 'English' : 'Portuguese'}. Return as JSON.`,
    output: { schema: IRSAssessmentOutputSchema }
  });
  return output!;
}

/**
 * Análise de orçamento familiar.
 */
export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Analyze this family budget for Portugal 2026 considering the economic context: ${JSON.stringify(input)}. Provide sustainability suggestions. Language: ${lang === 'en' ? 'English' : 'Portuguese'}. Return as JSON.`,
    output: { schema: FamilyBudgetOutputSchema }
  });
  return output!;
}

/**
 * Briefing de mercado para investidores.
 */
export async function getMarketAnalysis(lang: Language = 'pt') {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Provide a strategic market briefing for investors in Portugal for 2026. Analyze sectors like Energy, Tech, and Tourism. Language: ${lang === 'en' ? 'English' : 'Portuguese'}. Return as JSON.`,
    output: { schema: MarketAnalysisOutputSchema }
  });
  return output!;
}

/**
 * Notícias da atualidade política/económica.
 */
export async function getNewsFeed() {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Generate 5 relevant and realistic news feed items for Portugal in 2026. Focus on Economy, Law, and Social issues. Return as JSON.`,
    output: { schema: NewsFeedOutputSchema }
  });
  return output!;
}

/**
 * Extração de dados para gráficos no Explorador.
 */
export async function getChartFromRequest(input: { request: string }) {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Extract statistical data for: "${input.request}" in Portugal. Return labels and numerical values suitable for a chart. Return as JSON.`,
    output: { schema: ChartOutputSchema }
  });
  return output!;
}

/**
 * Busca de estatísticas públicas brutas.
 */
export async function getPublicStatistic(input: { request: string }) {
  const { text } = await ai.generate({
    model: MODEL_ID,
    prompt: `Find raw statistical data for: "${input.request}" regarding Portugal. Return JSON with 'data' stringified and 'explanation'.`,
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
