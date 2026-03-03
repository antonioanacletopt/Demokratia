
'use server';
/**
 * @fileOverview Server actions for Genkit AI integration.
 * 
 * This file handles all AI-powered functionality for the Demokratia app.
 * Using registered prompts to ensure stability in Next.js Server Actions.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin
const ai = genkit({
  plugins: [googleAI()],
});

// Explicit model reference
const geminiModel = 'googleai/gemini-1.5-flash';

export type Language = 'en' | 'pt';

// --- Schemas ---

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

const FamilyBudgetOutputSchema = z.object({
  analysis: z.string(),
  suggestions: z.array(z.string()),
});

// --- Registered Prompts ---

const irsPrompt = ai.definePrompt({
  name: 'irsPrompt',
  model: geminiModel,
  input: { schema: z.object({ inputData: z.any(), languageName: z.string() }) },
  output: { schema: IRSAssessmentOutputSchema },
  prompt: `Act as an elite tax consultant in Portugal for 2026. Calculate IRS for the following data: {{inputData}}. Provide response in {{languageName}}. Ensure technical accuracy according to CIRS 2026.`,
});

const simulationPrompt = ai.definePrompt({
  name: 'simulationPrompt',
  model: geminiModel,
  input: { schema: z.object({ policyDescription: z.string(), languageName: z.string() }) },
  output: { schema: EconomicPolicySimulationOutputSchema },
  prompt: `Simulate the detailed economic impact of this proposed policy in the context of Portugal 2026: {{policyDescription}}. Language: {{languageName}}. Use Okun's Law and multiplier effects for estimations.`,
});

const marketPrompt = ai.definePrompt({
  name: 'marketPrompt',
  model: geminiModel,
  input: { schema: z.object({ languageName: z.string() }) },
  output: { schema: MarketAnalysisOutputSchema },
  prompt: `As a Senior Market Analyst, provide a strategic briefing for investors in 2026. Analyze global events and their impact on Energy, Defense, Logistics, and Tech in Portugal. Language: {{languageName}}.`,
});

const factCheckPrompt = ai.definePrompt({
  name: 'factCheckPrompt',
  model: geminiModel,
  input: { schema: z.object({ claim: z.string(), languageName: z.string() }) },
  output: { schema: FactCheckOutputSchema },
  prompt: `Perform a rigorous fact-check on this claim regarding Portugal in 2026: {{claim}}. Language: {{languageName}}. Base your verdict on official statistical data and temporal context.`,
});

const legislationPrompt = ai.definePrompt({
  name: 'legislationPrompt',
  model: geminiModel,
  input: { schema: z.object({ question: z.string(), languageName: z.string() }) },
  output: { schema: ConsultLegislationOutputSchema },
  prompt: `Consult Portuguese legislation (Diário da República) to explain: {{question}}. Language: {{languageName}}. Focus on 2026 regulations and new laws.`,
});

const scenarioPrompt = ai.definePrompt({
  name: 'scenarioPrompt',
  model: geminiModel,
  input: { schema: z.object({ inputData: z.any(), languageName: z.string() }) },
  output: { schema: z.object({ feedback: z.string() }) },
  prompt: `Analyze this macroeconomic scenario for Portugal 2026: {{inputData}}. Act as a member of the Public Finance Council. Language: {{languageName}}.`,
});

const budgetPrompt = ai.definePrompt({
  name: 'budgetPrompt',
  model: geminiModel,
  input: { schema: z.object({ inputData: z.any(), languageName: z.string() }) },
  output: { schema: FamilyBudgetOutputSchema },
  prompt: `Provide financial coaching for this family budget in Portugal 2026: {{inputData}}. Language: {{languageName}}. Consider inflation and average purchasing power.`,
});

const translatePrompt = ai.definePrompt({
  name: 'translatePrompt',
  model: geminiModel,
  input: { schema: z.object({ text: z.string(), languageName: z.string() }) },
  prompt: `Translate the following text to {{languageName}}. Maintain the professional tone and ensure technical democratic/economic terms are translated correctly: {{text}}`,
});

const newsFeedPrompt = ai.definePrompt({
  name: 'newsFeedPrompt',
  model: geminiModel,
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
  model: geminiModel,
  input: { schema: z.object({ request: z.string() }) },
  output: { schema: z.object({ isFound: z.boolean(), data: z.string(), explanation: z.string(), source: z.string() }) },
  prompt: `Retrieve official factual statistical data from Portugal (INE/Pordata) for: {{request}}.`,
});

const chartFromRequestPrompt = ai.definePrompt({
  name: 'chartFromRequestPrompt',
  model: geminiModel,
  input: { schema: z.object({ request: z.string() }) },
  output: { 
    schema: z.object({ 
      isChartable: z.boolean(), 
      chartTitle: z.string(), 
      explanation: z.string(), 
      chartData: z.array(z.any()), 
      chartType: z.enum(['bar', 'line']), 
      yAxisLabel: z.string() 
    }) 
  },
  prompt: `Generate numeric series data for a chart based on this Portuguese request: {{request}}. Period: up to 2026.`,
});

// --- Exported Server Actions ---

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  const { output } = await irsPrompt({ inputData: JSON.stringify(input), languageName: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  const { output } = await simulationPrompt({ policyDescription: input.policyDescription, languageName: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  const { output } = await marketPrompt({ languageName: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  const { output } = await factCheckPrompt({ claim: input.claim, languageName: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  const { output } = await legislationPrompt({ question: input.question, languageName: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  const { output } = await scenarioPrompt({ inputData: JSON.stringify(input), languageName: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  const { output } = await budgetPrompt({ inputData: JSON.stringify(input), languageName: lang === 'en' ? 'English' : 'Portuguese' });
  return output!;
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  const { text: resultText } = await translatePrompt({ text, languageName: lang === 'en' ? 'English' : 'Portuguese' });
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
  const { output } = await chartFromRequestPrompt({ request: input.request });
  return output!;
}
