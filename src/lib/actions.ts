'use server';

/**
 * @fileOverview Server actions for Genkit AI integration.
 * Centralizes AI flows for economic simulations, fact-checking, and tax assessment.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit v1.x
const ai = genkit({
  plugins: [googleAI()],
});

const model = 'googleai/gemini-1.5-flash';

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

const ScenarioAnalysisOutputSchema = z.object({
  feedback: z.string(),
});

const FamilyBudgetAnalysisOutputSchema = z.object({
  analysis: z.string(),
  suggestions: z.array(z.string()),
});

// --- Exported Server Actions ---

export type Language = 'en' | 'pt';
export type EconomicPolicySimulationOutput = z.infer<typeof EconomicPolicySimulationOutputSchema>;
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;
export type ConsultLegislationOutput = z.infer<typeof ConsultLegislationOutputSchema>;
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model,
    input: { ...input, language: lang === 'en' ? 'English' : 'Portuguese' },
    prompt: `You are an elite tax consultant in Portugal for 2026. Calculate IRS for: ${JSON.stringify(input)}`,
    output: { schema: IRSAssessmentOutputSchema },
  });
  return output!;
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model,
    input: { ...input, language: lang === 'en' ? 'English' : 'Portuguese' },
    prompt: `Simulate the economic impact of this policy in Portugal 2026: ${input.policyDescription}. Language: ${lang}`,
    output: { schema: EconomicPolicySimulationOutputSchema },
  });
  return output!;
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model,
    input: { ...input, language: lang === 'en' ? 'English' : 'Portuguese' },
    prompt: `Fact-check this claim in the context of Portugal 2026: ${input.claim}. Language: ${lang}`,
    output: { schema: FactCheckOutputSchema },
  });
  return output!;
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model,
    input: { ...input, language: lang === 'en' ? 'English' : 'Portuguese' },
    prompt: `Explain Portuguese legislation regarding: ${input.question}. Language: ${lang}`,
    output: { schema: ConsultLegislationOutputSchema },
  });
  return output!;
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  const { text: translated } = await ai.generate({
    model,
    prompt: `Translate the following text to ${lang === 'en' ? 'English' : 'Portuguese'}. Maintain the tone and technical terms accurately: ${text}`,
  });
  return translated;
}

export async function getNewsFeed() {
  const { output } = await ai.generate({
    model,
    prompt: 'Generate 5 current and relevant news feed items for Portugal in 2026. Focus on economy, new laws, and fact-checking of public claims. Ensure the tone is neutral and professional.',
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

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model,
    prompt: `Act as a Senior Economist at the Portuguese Public Finance Council. Analyze this macroeconomic scenario for Portugal 2026: ${JSON.stringify(input)}. Provide a concise viability feedback in ${lang === 'en' ? 'English' : 'Portuguese'}.`,
    output: { schema: ScenarioAnalysisOutputSchema },
  });
  return output!;
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  const { output } = await ai.generate({
    model,
    prompt: `Analyze this family budget simulation for Portugal in 2026: ${JSON.stringify(input)}. Focus on the impact of inflation, housing costs, and potential savings. Language: ${lang === 'en' ? 'English' : 'Portuguese'}.`,
    output: { schema: FamilyBudgetAnalysisOutputSchema },
  });
  return output!;
}

export async function getPublicStatistic(input: { request: string }) {
  const { output } = await ai.generate({
    model,
    prompt: `Retrieve official Portuguese statistical data from portals like INE or Pordata for the following request: ${input.request}. If data is found, return it in a clear format. If not, explain why.`,
    output: {
      schema: z.object({
        isFound: z.boolean(),
        data: z.string(),
        explanation: z.string(),
        source: z.string(),
      }),
    },
  });
  return output!;
}

export async function getChartFromRequest(input: { request: string }) {
  const { output } = await ai.generate({
    model,
    prompt: `Generate time-series or categorical chart data for the following Portuguese statistical request: ${input.request}. Ensure the data is relevant for the period around 2026.`,
    output: {
      schema: z.object({
        isChartable: z.boolean(),
        chartTitle: z.string(),
        explanation: z.string(),
        chartData: z.array(z.any()),
        chartType: z.enum(['bar', 'line']),
        yAxisLabel: z.string(),
      }),
    },
  });
  return output!;
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  const { output } = await ai.generate({
    model,
    prompt: `You are a Senior Market Analyst. Provide a strategic market analysis for 2026 focusing on global impacts (Energy, Defense, Metals, Logistics) and sectors under pressure. Use current hypothetical scenarios (e.g. military escalation, high interest rates). Language: ${lang === 'en' ? 'English' : 'Portuguese'}`,
    output: { schema: MarketAnalysisOutputSchema },
  });
  return output!;
}
