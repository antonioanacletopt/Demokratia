'use server';
/**
 * @fileOverview Server actions for Demokratia Portugal using Genkit v1.x.
 * 
 * handles AI-driven simulations, fact-checks, and analyses using a robust
 * JSON-native approach to prevent "Unknown action type" errors in Next.js.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Inicialização estável do Genkit
const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

// Identificador canónico do modelo
const MODEL_ID = 'googleai/gemini-1.5-flash';

export type Language = 'en' | 'pt';

// --- Data Schemas (Zod Puro para Validação Robusta) ---

const EconomicPolicySimulationOutputSchema = z.object({
  simulatedImpact: z.string(),
  reasoning: z.string(),
  isRealPolicy: z.boolean(),
  source: z.string().optional(),
  keyIndicators: z.array(z.object({
    name: z.string(),
    currentValue: z.number(),
    projectedValue: z.number(),
    unit: z.string(),
  })),
});

export type EconomicPolicySimulationOutput = z.infer<typeof EconomicPolicySimulationOutputSchema>;

const FactCheckOutputSchema = z.object({
  verdict: z.enum(['Verdadeiro', 'Falso', 'Enganador', 'Sem Evidência']),
  explanation: z.string(),
  sources: z.array(z.string()),
});

export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;

const ConsultLegislationOutputSchema = z.object({
  answer: z.string(),
  sources: z.array(z.string()),
});

export type ConsultLegislationOutput = z.infer<typeof ConsultLegislationOutputSchema>;

const MarketAnalysisOutputSchema = z.object({
  sentiment: z.enum(['Bullish', 'Bearish', 'Neutral']),
  globalContext: z.string(),
  sectors: z.array(z.object({
    name: z.string(),
    context: z.string(),
    opportunity: z.string(),
    impact: z.string(),
  })),
  assets: z.array(z.object({
    name: z.string(),
    currentValue: z.number(),
    trend: z.string(),
  })),
});

export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;

const IRSAssessmentOutputSchema = z.object({
  estimatedTax: z.number(),
  refundOrPayment: z.number(),
  effectiveRate: z.number(),
  analysis: z.string(),
  tips: z.array(z.string()),
});

const FamilyBudgetOutputSchema = z.object({
  analysis: z.string(),
  suggestions: z.array(z.string()),
});

const NewsFeedOutputSchema = z.object({
  feedItems: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.enum(['Alegação', 'Nova Lei', 'Análise']),
    source: z.string(),
    date: z.string(),
    actionLink: z.object({
      label: z.string(),
      href: z.string(),
    }).optional(),
  })),
});

const StatisticOutputSchema = z.object({
  isFound: z.boolean(),
  data: z.string(),
  explanation: z.string(),
  source: z.string()
});

const ChartOutputSchema = z.object({ 
  isChartable: z.boolean(), 
  chartTitle: z.string(), 
  explanation: z.string(), 
  chartData: z.array(z.any()), 
  chartType: z.enum(['bar', 'line']), 
  yAxisLabel: z.string() 
});

// --- Helper para Geração JSON Robusta ---

async function generateStructuredData<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown formatting or backticks.`,
    config: {
      responseMimeType: 'application/json',
    }
  });

  try {
    const rawOutput = response.text;
    const parsed = JSON.parse(rawOutput);
    return schema.parse(parsed);
  } catch (e) {
    console.error('AI JSON Parsing Error:', e);
    throw new Error('Falha na resposta estruturada da IA.');
  }
}

// --- Exported Server Actions ---

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Act as an elite tax consultant in Portugal for 2026. Calculate IRS for the following data: ${JSON.stringify(input)}. Provide response in ${langName}. Ensure technical accuracy according to CIRS 2026.`,
    IRSAssessmentOutputSchema
  );
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Simulate the detailed economic impact of this proposed policy in the context of Portugal 2026: ${input.policyDescription}. Language: ${langName}. Use Okun's Law and multiplier effects for estimations.`,
    EconomicPolicySimulationOutputSchema
  );
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `As a Senior Market Analyst, provide a strategic briefing for investors in 2026. Analyze global events and their impact on Energy, Defense, Logistics, and Tech in Portugal. Language: ${langName}.`,
    MarketAnalysisOutputSchema
  );
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Perform a rigorous fact-check on this claim regarding Portugal in 2026: ${input.claim}. Language: ${langName}. Base your verdict on official statistical data and temporal context.`,
    FactCheckOutputSchema
  );
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Consult Portuguese legislation (Diário da República) to explain: ${input.question}. Language: ${langName}. Focus on 2026 regulations and new laws.`,
    ConsultLegislationOutputSchema
  );
}

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const schema = z.object({ feedback: z.string() });
  return generateStructuredData(
    `Analyze this macroeconomic scenario for Portugal 2026: ${JSON.stringify(input)}. Act as a member of the Public Finance Council. Language: ${langName}.`,
    schema
  );
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Provide financial coaching for this family budget in Portugal 2026: ${JSON.stringify(input)}. Language: ${langName}. Consider inflation and average purchasing power.`,
    FamilyBudgetOutputSchema
  );
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Translate the following text to ${langName}. Maintain the professional tone and ensure technical democratic/economic terms are translated correctly: ${text}`,
  });
  return response.text || text;
}

export async function getNewsFeed() {
  return generateStructuredData(
    'Generate exactly 5 relevant and timely news feed items for Portugal in the year 2026. Categories: Fact-Check, New Law, Economic Analysis. Use a formal and objective tone.',
    NewsFeedOutputSchema
  );
}

export async function getPublicStatistic(input: { request: string }) {
  return generateStructuredData(
    `Retrieve official factual statistical data from Portugal (INE/Pordata) for: ${input.request}.`,
    StatisticOutputSchema
  );
}

export async function getChartFromRequest(input: { request: string }) {
  return generateStructuredData(
    `Generate numeric series data for a chart based on this Portuguese request: ${input.request}. Period: up to 2026.`,
    ChartOutputSchema
  );
}
