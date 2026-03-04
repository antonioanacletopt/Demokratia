'use server';
/**
 * @fileOverview Server actions for Demokratia Portugal using Genkit v1.x.
 * 
 * Handles AI-driven simulations, fact-checks, and analyses using robust
 * string identifiers and manual JSON parsing to prevent registration errors.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit instance with singleton pattern for Next.js stability
const ai = (globalThis as any)._aiInstance ?? genkit({
  plugins: [googleAI()],
});
if (!(globalThis as any)._aiInstance) {
  (globalThis as any)._aiInstance = ai;
}

const MODEL_ID = 'googleai/gemini-1.5-flash';

export type Language = 'en' | 'pt';

// --- Data Schemas for Validation ---

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

// --- Server Actions ---

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Act as an elite tax consultant in Portugal for 2026. Calculate IRS for: ${JSON.stringify(input)}. Language: ${langName}. Ensure technical precision with CIRS 2026. Return as JSON.`,
    config: { responseMimeType: 'application/json' }
  });
  return IRSAssessmentOutputSchema.parse(JSON.parse(response.text));
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Simulate detailed economic impact of this policy in Portugal 2026: ${input.policyDescription}. Language: ${langName}. Use Okun's Law and multipliers. Return as JSON.`,
    config: { responseMimeType: 'application/json' }
  });
  return EconomicPolicySimulationOutputSchema.parse(JSON.parse(response.text));
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `As a Senior Market Analyst, provide a strategic briefing for investors in 2026 regarding Portugal. Language: ${langName}. Return as JSON.`,
    config: { responseMimeType: 'application/json' }
  });
  return MarketAnalysisOutputSchema.parse(JSON.parse(response.text));
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Perform rigorous fact-check on this claim about Portugal 2026: ${input.claim}. Language: ${langName}. Base on official stats. Return as JSON.`,
    config: { responseMimeType: 'application/json' }
  });
  return FactCheckOutputSchema.parse(JSON.parse(response.text));
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Explain Portuguese legislation (Diário da República) for: ${input.question}. Language: ${langName}. Focus on 2026 rules. Return as JSON.`,
    config: { responseMimeType: 'application/json' }
  });
  return ConsultLegislationOutputSchema.parse(JSON.parse(response.text));
}

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Analyze this macroeconomic scenario for Portugal 2026: ${JSON.stringify(input)}. Language: ${langName}. Return a JSON object with a 'feedback' field.`,
    config: { responseMimeType: 'application/json' }
  });
  const data = JSON.parse(response.text);
  return { feedback: data.feedback || response.text };
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Provide financial coaching for this household budget in Portugal 2026: ${JSON.stringify(input)}. Language: ${langName}. Return as JSON.`,
    config: { responseMimeType: 'application/json' }
  });
  return FamilyBudgetOutputSchema.parse(JSON.parse(response.text));
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Translate the following text to ${langName}. Keep professional tone: ${text}`,
  });
  return response.text;
}

export async function getNewsFeed() {
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: 'Generate exactly 5 news feed items for Portugal in 2026. Categories: Fact-Check, New Law, Economic Analysis. Return as JSON.',
    config: { responseMimeType: 'application/json' }
  });
  return NewsFeedOutputSchema.parse(JSON.parse(response.text));
}

export async function getPublicStatistic(input: { request: string }) {
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Retrieve official factual statistical data for Portugal: ${input.request}. Return a JSON object with isFound, data (stringified array), explanation, and source.`,
    config: { responseMimeType: 'application/json' }
  });
  return z.object({
    isFound: z.boolean(),
    data: z.string(),
    explanation: z.string(),
    source: z.string()
  }).parse(JSON.parse(response.text));
}

export async function getChartFromRequest(input: { request: string }) {
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Generate numeric series data for a chart based on this Portuguese request: ${input.request}. Period: up to 2026. Return a JSON object with isChartable, chartTitle, explanation, chartData (array), chartType (bar/line), and yAxisLabel.`,
    config: { responseMimeType: 'application/json' }
  });
  return z.object({ 
    isChartable: z.boolean(), 
    chartTitle: z.string(), 
    explanation: z.string(), 
    chartData: z.array(z.any()), 
    chartType: z.enum(['bar', 'line']), 
    yAxisLabel: z.string() 
  }).parse(JSON.parse(response.text));
}