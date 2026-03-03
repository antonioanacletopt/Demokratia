
'use server';
/**
 * @fileOverview Server actions for Demokratia Portugal using Genkit v1.x.
 * 
 * This file handles AI-driven simulations, fact-checks, and analyses.
 * It uses defined prompts to ensure stable action registration in Next.js.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
    }),
  ],
});

export type Language = 'en' | 'pt';

const MODEL_ID = 'googleai/gemini-1.5-flash';

// --- Data Schemas ---

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

// --- Defined Prompts ---

const irsPrompt = ai.definePrompt({
  name: 'irsPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ inputStr: z.string(), langName: z.string() }) },
  output: { schema: IRSAssessmentOutputSchema },
  prompt: `Act as an elite tax consultant in Portugal for 2026. Calculate IRS for the following data: {{inputStr}}. Provide response in {{langName}}. Ensure technical accuracy according to CIRS 2026.`,
});

const economicSimulationPrompt = ai.definePrompt({
  name: 'economicSimulationPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ policyDescription: z.string(), langName: z.string() }) },
  output: { schema: EconomicPolicySimulationOutputSchema },
  prompt: `Simulate the detailed economic impact of this proposed policy in the context of Portugal 2026: {{policyDescription}}. Language: {{langName}}. Use Okun's Law and multiplier effects for estimations.`,
});

const marketAnalysisPrompt = ai.definePrompt({
  name: 'marketAnalysisPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ langName: z.string() }) },
  output: { schema: MarketAnalysisOutputSchema },
  prompt: `As a Senior Market Analyst, provide a strategic briefing for investors in 2026. Analyze global events and their impact on Energy, Defense, Logistics, and Tech in Portugal. Language: {{langName}}.`,
});

const factCheckPrompt = ai.definePrompt({
  name: 'factCheckPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ claim: z.string(), langName: z.string() }) },
  output: { schema: FactCheckOutputSchema },
  prompt: `Perform a rigorous fact-check on this claim regarding Portugal in 2026: {{claim}}. Language: {{langName}}. Base your verdict on official statistical data and temporal context.`,
});

const legislationPrompt = ai.definePrompt({
  name: 'legislationPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ question: z.string(), langName: z.string() }) },
  output: { schema: ConsultLegislationOutputSchema },
  prompt: `Consult Portuguese legislation (Diário da República) to explain: {{question}}. Language: {{langName}}. Focus on 2026 regulations and new laws.`,
});

const scenarioAnalysisPrompt = ai.definePrompt({
  name: 'scenarioAnalysisPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ inputStr: z.string(), langName: z.string() }) },
  output: { schema: z.object({ feedback: z.string() }) },
  prompt: `Analyze this macroeconomic scenario for Portugal 2026: {{inputStr}}. Act as a member of the Public Finance Council. Language: {{langName}}.`,
});

const familyBudgetPrompt = ai.definePrompt({
  name: 'familyBudgetPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ inputStr: z.string(), langName: z.string() }) },
  output: { schema: FamilyBudgetOutputSchema },
  prompt: `Provide financial coaching for this family budget in Portugal 2026: {{inputStr}}. Language: {{langName}}. Consider inflation and average purchasing power.`,
});

const translationPrompt = ai.definePrompt({
  name: 'translationPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ text: z.string(), langName: z.string() }) },
  prompt: `Translate the following text to {{langName}}. Maintain the professional tone and ensure technical democratic/economic terms are translated correctly: {{text}}`,
});

const newsFeedPrompt = ai.definePrompt({
  name: 'newsFeedPrompt',
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

const publicStatisticPrompt = ai.definePrompt({
  name: 'publicStatisticPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ request: z.string() }) },
  output: { schema: StatisticOutputSchema },
  prompt: `Retrieve official factual statistical data from Portugal (INE/Pordata) for: {{request}}.`,
});

const chartRequestPrompt = ai.definePrompt({
  name: 'chartRequestPrompt',
  model: MODEL_ID,
  input: { schema: z.object({ request: z.string() }) },
  output: { schema: ChartOutputSchema },
  prompt: `Generate numeric series data for a chart based on this Portuguese request: {{request}}. Period: up to 2026.`,
});

// --- Exported Server Actions ---

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { output } = await irsPrompt({ inputStr: JSON.stringify(input), langName });
  return output!;
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { output } = await economicSimulationPrompt({ policyDescription: input.policyDescription, langName });
  return output!;
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { output } = await marketAnalysisPrompt({ langName });
  return output!;
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { output } = await factCheckPrompt({ claim: input.claim, langName });
  return output!;
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { output } = await legislationPrompt({ question: input.question, langName });
  return output!;
}

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { output } = await scenarioAnalysisPrompt({ inputStr: JSON.stringify(input), langName });
  return output!;
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { output } = await familyBudgetPrompt({ inputStr: JSON.stringify(input), langName });
  return output!;
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { text: resultText } = await translationPrompt({ text, langName });
  return resultText || text;
}

export async function getNewsFeed() {
  const { output } = await newsFeedPrompt();
  return output!;
}

export async function getPublicStatistic(input: { request: string }) {
  const { output } = await publicStatisticPrompt({ request: input.request });
  return output!;
}

export async function getChartFromRequest(input: { request: string }) {
  const { output } = await chartRequestPrompt({ request: input.request });
  return output!;
}
