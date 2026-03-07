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

// Inicialização do Genkit 1.x com o plugin oficial do Google AI
const ai = genkit({
  plugins: [googleAI()],
});

// Identificador do modelo absoluto para máxima estabilidade. 
// O sufixo -latest ou a falta de prefixo podem causar erros 404 em certas regiões/versões.
const MODEL_ID = 'googleai/gemini-1.5-flash';

/**
 * Tradução de texto mantendo o tom técnico e contexto político/económico.
 */
export async function getTranslation(text: string, lang: Language) {
  const target = lang === 'en' ? 'English' : 'Portuguese';
  const { text: translated } = await ai.generate({
    model: MODEL_ID,
    prompt: `Translate the following text to ${target}. Maintain the tone and technical terms: ${text}`,
  });
  return translated || text;
}

/**
 * Simulação de impacto económico de propostas em Portugal 2026.
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
 * Verificação de factos com base em fontes oficiais (INE, Pordata, DGO).
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
 * Consulta de legislação baseada no Diário da República (DRE).
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
 * Análise técnica de cenários macroeconómicos para o Laboratório.
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
 * Avaliação de parâmetros fiscais de IRS para o ano de 2026.
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
 * Análise preditiva de sustentabilidade de orçamento familiar.
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
 * Briefing estratégico de mercado para o portal do investidor.
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
 * Geração de feed de notícias baseado na atualidade simulada de 2026.
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
 * Processamento de linguagem natural para extração de dados estruturados (gráficos).
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
 * Busca inteligente de estatísticas públicas brutas.
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
