'use server';
/**
 * @fileOverview Server actions for Genkit AI integration.
 * Implements the stable Prompt-in-Flow pattern for Genkit v1.x to avoid registration errors.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit instance with the Google AI plugin
// We do not export this object to comply with "use server" rules (only async functions can be exported)
const ai = genkit({
  plugins: [googleAI()],
});

// Explicit Model ID for stability
const MODEL_ID = 'googleai/gemini-1.5-flash';

// --- Types ---
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

const FactCheckOutputSchema = z.object({
  verdict: z.enum(['Verdadeiro', 'Falso', 'Enganador', 'Sem Evidência']),
  explanation: z.string(),
  sources: z.array(z.string()),
});

const ConsultLegislationOutputSchema = z.object({
  answer: z.string(),
  sources: z.array(z.string()),
});

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

const IRSAssessmentOutputSchema = z.object({
  estimatedTax: z.number(),
  refundOrPayment: z.number(),
  effectiveRate: z.number(),
  analysis: z.string(),
  tips: z.array(z.string()),
});

// --- Prompts (Stable Action Registration) ---

const irsPrompt = ai.definePrompt({
  name: 'irsPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ data: z.any(), lang: z.string() }) },
  output: { schema: IRSAssessmentOutputSchema },
  prompt: `Act as an elite tax consultant in Portugal for 2026. Calculate IRS for the following data: {{json data}}. Provide response in {{lang}}. Ensure technical accuracy according to CIRS 2026.`,
});

const simulationPrompt = ai.definePrompt({
  name: 'simulationPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ description: z.string(), lang: z.string() }) },
  output: { schema: EconomicPolicySimulationOutputSchema },
  prompt: `Simulate the detailed economic impact of this proposed policy in the context of Portugal 2026: {{description}}. Language: {{lang}}. Use Okun's Law and multiplier effects for estimations.`,
});

const marketPrompt = ai.definePrompt({
  name: 'marketPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ lang: z.string() }) },
  output: { schema: MarketAnalysisOutputSchema },
  prompt: `As a Senior Market Analyst, provide a strategic briefing for investors in 2026. Analyze global events and their impact on Energy, Defense, Logistics, and Tech in Portugal. Language: {{lang}}.`,
});

const factCheckPrompt = ai.definePrompt({
  name: 'factCheckPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ claim: z.string(), lang: z.string() }) },
  output: { schema: FactCheckOutputSchema },
  prompt: `Perform a rigorous fact-check on this claim regarding Portugal in 2026: {{claim}}. Language: {{lang}}. Base your verdict on official statistical data and temporal context.`,
});

const legislationPrompt = ai.definePrompt({
  name: 'legislationPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ question: z.string(), lang: z.string() }) },
  output: { schema: ConsultLegislationOutputSchema },
  prompt: `Consult Portuguese legislation (Diário da República) to explain: {{question}}. Language: {{lang}}. Focus on 2026 regulations and new laws.`,
});

const scenarioPrompt = ai.definePrompt({
  name: 'scenarioPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ context: z.any(), lang: z.string() }) },
  output: { schema: z.object({ feedback: z.string() }) },
  prompt: `Analyze this macroeconomic scenario for Portugal 2026: {{json context}}. Act as a member of the Public Finance Council. Language: {{lang}}.`,
});

const budgetPrompt = ai.definePrompt({
  name: 'budgetPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ budget: z.any(), lang: z.string() }) },
  output: { schema: z.object({ analysis: z.string(), suggestions: z.array(z.string()) }) },
  prompt: `Provide financial coaching for this family budget in Portugal 2026: {{json budget}}. Language: {{lang}}. Consider inflation and average purchasing power.`,
});

// --- Flows (Business Logic) ---

const irsFlow = ai.defineFlow({ name: 'irsFlow', inputSchema: z.object({ data: z.any(), lang: z.string() }), outputSchema: IRSAssessmentOutputSchema }, async (i) => {
  const { output } = await irsPrompt(i);
  return output!;
});

const simulationFlow = ai.defineFlow({ name: 'simulationFlow', inputSchema: z.object({ description: z.string(), lang: z.string() }), outputSchema: EconomicPolicySimulationOutputSchema }, async (i) => {
  const { output } = await simulationPrompt(i);
  return output!;
});

const marketFlow = ai.defineFlow({ name: 'marketFlow', inputSchema: z.object({ lang: z.string() }), outputSchema: MarketAnalysisOutputSchema }, async (i) => {
  const { output } = await marketPrompt(i);
  return output!;
});

const factCheckFlow = ai.defineFlow({ name: 'factCheckFlow', inputSchema: z.object({ claim: z.string(), lang: z.string() }), outputSchema: FactCheckOutputSchema }, async (i) => {
  const { output } = await factCheckPrompt(i);
  return output!;
});

const legislationFlow = ai.defineFlow({ name: 'legislationFlow', inputSchema: z.object({ question: z.string(), lang: z.string() }), outputSchema: ConsultLegislationOutputSchema }, async (i) => {
  const { output } = await legislationPrompt(i);
  return output!;
});

const scenarioFlow = ai.defineFlow({ name: 'scenarioFlow', inputSchema: z.object({ context: z.any(), lang: z.string() }), outputSchema: z.object({ feedback: z.string() }) }, async (i) => {
  const { output } = await scenarioPrompt(i);
  return output!;
});

const budgetFlow = ai.defineFlow({ name: 'budgetFlow', inputSchema: z.object({ budget: z.any(), lang: z.string() }), outputSchema: z.object({ analysis: z.string(), suggestions: z.array(z.string()) }) }, async (i) => {
  const { output } = await budgetPrompt(i);
  return output!;
});

// --- Exported Server Actions ---

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  return irsFlow({ data: input, lang: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  return simulationFlow({ description: input.policyDescription, lang: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  return marketFlow({ lang: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  return factCheckFlow({ claim: input.claim, lang: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  return legislationFlow({ question: input.question, lang: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  return scenarioFlow({ context: input, lang: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  return budgetFlow({ budget: input, lang: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  const { text: translated } = await ai.generate({
    model: MODEL_ID,
    prompt: `Translate the following text to ${lang === 'en' ? 'English' : 'Portuguese'}. Maintain the professional tone and ensure technical democratic/economic terms are translated correctly: ${text}`,
  });
  return translated || text;
}

export async function getNewsFeed() {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: 'Generate exactly 5 relevant and timely news feed items for Portugal in the year 2026. Categories: Fact-Check, New Law, Economic Analysis. Use a formal and objective tone.',
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
      }),
    },
  });
  return output!;
}

export async function getPublicStatistic(input: { request: string }) {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Retrieve official factual statistical data from Portugal (INE/Pordata) for: ${input.request}.`,
    output: { schema: z.object({ isFound: z.boolean(), data: z.string(), explanation: z.string(), source: z.string() }) },
  });
  return output!;
}

export async function getChartFromRequest(input: { request: string }) {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Generate numeric series data for a chart based on this Portuguese request: ${input.request}. Period: up to 2026.`,
    output: { schema: z.object({ isChartable: z.boolean(), chartTitle: z.string(), explanation: z.string(), chartData: z.array(z.any()), chartType: z.enum(['bar', 'line']), yAxisLabel: z.string() }) },
  });
  return output!;
}
