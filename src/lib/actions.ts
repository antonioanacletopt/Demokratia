
'use server';
/**
 * @fileOverview Server actions for Genkit AI integration.
 * Using Genkit v1.x definePrompt pattern for maximum stability in Next.js.
 *
 * - getIRSAssessment - AI tax projection.
 * - getEconomicSimulation - Policy impact simulation.
 * - getMarketAnalysis - Investor strategic briefing.
 * - getFactCheck - Claim validation.
 * - getLegislationInfo - Legal query analysis.
 * - getNewsFeed - Automated daily democratic briefing.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit instance
const ai = genkit({
  plugins: [googleAI()],
});

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

// --- Prompt Definitions ---

const irsPrompt = ai.definePrompt({
  name: 'irsPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ input: z.string(), lang: z.string() }) },
  output: { schema: IRSAssessmentOutputSchema },
  prompt: `Act as an elite tax consultant in Portugal for 2026. Calculate IRS for the following data: {{input}}. Provide response in {{lang}}. Ensure technical accuracy according to CIRS 2026.`,
});

const simulationPrompt = ai.definePrompt({
  name: 'simulationPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ policyDescription: z.string(), lang: z.string() }) },
  output: { schema: EconomicPolicySimulationOutputSchema },
  prompt: `Simulate the detailed economic impact of this proposed policy in the context of Portugal 2026: {{policyDescription}}. Language: {{lang}}. Use Okun's Law and multiplier effects for estimations.`,
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
  input: { schema: z.object({ input: z.string(), lang: z.string() }) },
  output: { schema: z.object({ feedback: z.string() }) },
  prompt: `Analyze this macroeconomic scenario for Portugal 2026: {{input}}. Act as a member of the Public Finance Council. Language: {{lang}}.`,
});

const budgetPrompt = ai.definePrompt({
  name: 'budgetPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ input: z.string(), lang: z.string() }) },
  output: { schema: z.object({ analysis: z.string(), suggestions: z.array(z.string()) }) },
  prompt: `Provide financial coaching for this family budget in Portugal 2026: {{input}}. Language: {{lang}}. Consider inflation and average purchasing power.`,
});

const statisticPrompt = ai.definePrompt({
  name: 'statisticPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ request: z.string() }) },
  output: { schema: z.object({ isFound: z.boolean(), data: z.string(), explanation: z.string(), source: z.string() }) },
  prompt: `Retrieve official factual statistical data from Portugal (INE/Pordata) for: {{request}}.`,
});

const chartPrompt = ai.definePrompt({
  name: 'chartPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ request: z.string() }) },
  output: { schema: z.object({ isChartable: z.boolean(), chartTitle: z.string(), explanation: z.string(), chartData: z.array(z.any()), chartType: z.enum(['bar', 'line']), yAxisLabel: z.string() }) },
  prompt: `Generate numeric series data for a chart based on this Portuguese request: {{request}}. Period: up to 2026.`,
});

const newsFeedPrompt = ai.definePrompt({
  name: 'newsFeedPrompt',
  model: MODEL_ID,
  input: { schema: z.any() },
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
  prompt: 'Generate exactly 5 relevant and timely news feed items for Portugal in the year 2026. Categories: Fact-Check, New Law, Economic Analysis. Use a formal and objective tone.',
});

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  model: MODEL_ID,
  input: { schema: z.object({ text: z.string(), lang: z.string() }) },
  prompt: `Translate the following text to {{lang}}. Maintain the professional tone and ensure technical democratic/economic terms are translated correctly: {{text}}`,
});

// --- Exported Server Actions ---

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  const { output } = await irsPrompt({ input: JSON.stringify(input), lang: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  const { output } = await simulationPrompt({ ...input, lang: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  const { output } = await marketPrompt({ lang: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  const { output } = await factCheckPrompt({ ...input, lang: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  const { output } = await legislationPrompt({ ...input, lang: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  const { text: translated } = await translatePrompt({ text, lang: lang === 'en' ? 'English' : 'Portuguese' });
  return translated || text;
}

export async function getNewsFeed() {
  const { output } = await newsFeedPrompt({});
  return output!;
}

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  const { output } = await scenarioPrompt({ input: JSON.stringify(input), lang: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  const { output } = await budgetPrompt({ input: JSON.stringify(input), lang: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getPublicStatistic(input: { request: string }) {
  const { output } = await statisticPrompt(input);
  return output!;
}

export async function getChartFromRequest(input: { request: string }) {
  const { output } = await chartPrompt(input);
  return output!;
}
