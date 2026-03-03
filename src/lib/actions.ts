'use server';
/**
 * @fileOverview Server actions for Demokratia Portugal using Genkit v1.x.
 * 
 * Centralizes all AI logic using registered Prompts and Flows to ensure
 * stability in Next.js Server Actions and resolve "Unknown action type" errors.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin
const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
});

const MODEL_ID = 'googleai/gemini-1.5-flash';

export type Language = 'en' | 'pt';

// --- Output Schemas ---

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

// --- Registered Prompts (Handlebars) ---

const irsPrompt = ai.definePrompt({
  name: 'irsPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ data: z.any(), langName: z.string() }) },
  output: { schema: IRSAssessmentOutputSchema },
  prompt: `Act as an elite tax consultant in Portugal for 2026. Calculate IRS for the following data: {{{data}}}. Provide response in {{{langName}}}. Ensure technical accuracy according to CIRS 2026.`,
});

const simulationPrompt = ai.definePrompt({
  name: 'simulationPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ description: z.string(), langName: z.string() }) },
  output: { schema: EconomicPolicySimulationOutputSchema },
  prompt: `Simulate the detailed economic impact of this proposed policy in the context of Portugal 2026: {{{description}}}. Language: {{{langName}}}. Use Okun's Law and multiplier effects for estimations.`,
});

const marketPrompt = ai.definePrompt({
  name: 'marketPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ langName: z.string() }) },
  output: { schema: MarketAnalysisOutputSchema },
  prompt: `As a Senior Market Analyst, provide a strategic briefing for investors in 2026. Analyze global events and their impact on Energy, Defense, Logistics, and Tech in Portugal. Language: {{{langName}}}.`,
});

const factCheckPrompt = ai.definePrompt({
  name: 'factCheckPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ claim: z.string(), langName: z.string() }) },
  output: { schema: FactCheckOutputSchema },
  prompt: `Perform a rigorous fact-check on this claim regarding Portugal in 2026: {{{claim}}}. Language: {{{langName}}}. Base your verdict on official statistical data and temporal context.`,
});

const legislationPrompt = ai.definePrompt({
  name: 'legislationPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ question: z.string(), langName: z.string() }) },
  output: { schema: ConsultLegislationOutputSchema },
  prompt: `Consult Portuguese legislation (Diário da República) to explain: {{{question}}}. Language: {{{langName}}}. Focus on 2026 regulations and new laws.`,
});

const scenarioPrompt = ai.definePrompt({
  name: 'scenarioPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ data: z.any(), langName: z.string() }) },
  output: { schema: z.object({ feedback: z.string() }) },
  prompt: `Analyze this macroeconomic scenario for Portugal 2026: {{{data}}}. Act as a member of the Public Finance Council. Language: {{{langName}}}.`,
});

const budgetPrompt = ai.definePrompt({
  name: 'budgetPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ data: z.any(), langName: z.string() }) },
  output: { schema: FamilyBudgetOutputSchema },
  prompt: `Provide financial coaching for this family budget in Portugal 2026: {{{data}}}. Language: {{{langName}}}. Consider inflation and average purchasing power.`,
});

// --- Registered Flows ---

const irsFlow = ai.defineFlow({ name: 'irsFlow', inputSchema: z.object({ input: z.any(), lang: z.string() }) }, async (i) => {
  const { output } = await irsPrompt({ data: JSON.stringify(i.input), langName: i.lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
});

const simulationFlow = ai.defineFlow({ name: 'simulationFlow', inputSchema: z.object({ description: z.string(), lang: z.string() }) }, async (i) => {
  const { output } = await simulationPrompt({ description: i.description, langName: i.lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
});

const marketFlow = ai.defineFlow({ name: 'marketFlow', inputSchema: z.object({ lang: z.string() }) }, async (i) => {
  const { output } = await marketPrompt({ langName: i.lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
});

const factCheckFlow = ai.defineFlow({ name: 'factCheckFlow', inputSchema: z.object({ claim: z.string(), lang: z.string() }) }, async (i) => {
  const { output } = await factCheckPrompt({ claim: i.claim, langName: i.lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
});

const legislationFlow = ai.defineFlow({ name: 'legislationFlow', inputSchema: z.object({ question: z.string(), lang: z.string() }) }, async (i) => {
  const { output } = await legislationPrompt({ question: i.question, langName: i.lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
});

const scenarioFlow = ai.defineFlow({ name: 'scenarioFlow', inputSchema: z.object({ data: z.any(), lang: z.string() }) }, async (i) => {
  const { output } = await scenarioPrompt({ data: JSON.stringify(i.data), langName: i.lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
});

const budgetFlow = ai.defineFlow({ name: 'budgetFlow', inputSchema: z.object({ data: z.any(), lang: z.string() }) }, async (i) => {
  const { output } = await budgetPrompt({ data: JSON.stringify(i.data), langName: i.lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
});

// --- Exported Server Actions calling the Flows ---

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  return irsFlow({ input, lang });
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  return simulationFlow({ description: input.policyDescription, lang });
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  return marketFlow({ lang });
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  return factCheckFlow({ claim: input.claim, lang });
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  return legislationFlow({ question: input.question, lang });
}

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  return scenarioFlow({ data: input, lang });
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  return budgetFlow({ data: input, lang });
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { text: resultText } = await ai.generate({
    model: MODEL_ID,
    prompt: `Translate the following text to ${langName}. Maintain the professional tone and ensure technical democratic/economic terms are translated correctly: ${text}`,
  });
  return resultText || text;
}

export async function getNewsFeed() {
  const { output } = await ai.generate({
    model: MODEL_ID,
    output: {
      schema: z.object({
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
      })
    },
    prompt: 'Generate exactly 5 relevant and timely news feed items for Portugal in the year 2026. Categories: Fact-Check, New Law, Economic Analysis. Use a formal and objective tone.',
  });
  return output!;
}

export async function getPublicStatistic(input: { request: string }) {
  const { output } = await ai.generate({
    model: MODEL_ID,
    output: { schema: StatisticOutputSchema },
    prompt: `Retrieve official factual statistical data from Portugal (INE/Pordata) for: ${input.request}.`,
  });
  return output!;
}

export async function getChartFromRequest(input: { request: string }) {
  const { output } = await ai.generate({
    model: MODEL_ID,
    output: { schema: ChartOutputSchema },
    prompt: `Generate numeric series data for a chart based on this Portuguese request: ${input.request}. Period: up to 2026.`,
  });
  return output!;
}
