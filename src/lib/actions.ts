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
  model: 'googleai/gemini-1.5-flash',
});

// --- Internal Schemas (not exported) ---

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

// --- Exported Types ---

export type EconomicPolicySimulationOutput = z.infer<typeof EconomicPolicySimulationOutputSchema>;
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;
export type ConsultLegislationOutput = z.infer<typeof ConsultLegislationOutputSchema>;
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;

// --- Internal Flow Definitions (not exported) ---

const calculateIRSFlow = ai.defineFlow(
  {
    name: 'calculateIRSFlow',
    inputSchema: z.any(),
    outputSchema: z.object({
      estimatedTax: z.number(),
      refundOrPayment: z.number(),
      effectiveRate: z.number(),
      analysis: z.string(),
      tips: z.array(z.string()),
    }),
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are an elite tax consultant in Portugal for 2026. Calculate IRS for: ${JSON.stringify(input)}`,
      output: {
        schema: z.object({
          estimatedTax: z.number(),
          refundOrPayment: z.number(),
          effectiveRate: z.number(),
          analysis: z.string(),
          tips: z.array(z.string()),
        }),
      },
    });
    return output!;
  }
);

const simulateEconomicPolicy = ai.defineFlow(
  {
    name: 'simulateEconomicPolicy',
    inputSchema: z.object({ policyDescription: z.string(), language: z.string() }),
    outputSchema: EconomicPolicySimulationOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `Simulate the economic impact of this policy in Portugal 2026: ${input.policyDescription}. Language: ${input.language}`,
      output: { schema: EconomicPolicySimulationOutputSchema },
    });
    return output!;
  }
);

const factCheckFlow = ai.defineFlow(
  {
    name: 'factCheckFlow',
    inputSchema: z.object({ claim: z.string(), language: z.string() }),
    outputSchema: FactCheckOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `Fact-check this claim in the context of Portugal 2026: ${input.claim}. Language: ${input.language}`,
      output: { schema: FactCheckOutputSchema },
    });
    return output!;
  }
);

const consultLegislationFlow = ai.defineFlow(
  {
    name: 'consultLegislationFlow',
    inputSchema: z.object({ question: z.string(), language: z.string() }),
    outputSchema: ConsultLegislationOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `Explain Portuguese legislation regarding: ${input.question}. Language: ${input.language}`,
      output: { schema: ConsultLegislationOutputSchema },
    });
    return output!;
  }
);

const getMarketAnalysisFlow = ai.defineFlow(
  {
    name: 'getMarketAnalysisFlow',
    inputSchema: z.object({ language: z.string() }),
    outputSchema: MarketAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are a Senior Market Analyst. Provide a strategic market analysis for 2026 focusing on global impacts (Energy, Defense, Metals, Logistics) and sectors under pressure. Use current hypothetical scenarios (e.g. military escalation, high interest rates). Language: ${input.language}`,
      output: { schema: MarketAnalysisOutputSchema },
    });
    return output!;
  }
);

// --- Exported Server Actions (Only async functions) ---

export type Language = 'en' | 'pt';

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  return calculateIRSFlow({ ...input, language: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  return simulateEconomicPolicy({ ...input, language: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  return factCheckFlow({ ...input, language: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  return consultLegislationFlow({ ...input, language: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  const { text: translated } = await ai.generate({
    prompt: `Translate to ${lang === 'en' ? 'English' : 'Portuguese'}: ${text}`,
  });
  return translated;
}

export async function getNewsFeed() {
  const { output } = await ai.generate({
    prompt: 'Generate 5 news feed items for Portugal 2026 about economy, laws, and claims.',
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
    prompt: `Analyze this economic scenario for Portugal 2026: ${JSON.stringify(input)}. Language: ${lang}`,
    output: {
      schema: z.object({
        feedback: z.string(),
      }),
    },
  });
  return output!;
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  const { output } = await ai.generate({
    prompt: `Analyze this family budget for Portugal 2026: ${JSON.stringify(input)}. Language: ${lang}`,
    output: {
      schema: z.object({
        analysis: z.string(),
        suggestions: z.array(z.string()),
      }),
    },
  });
  return output!;
}

export async function getPublicStatistic(input: { request: string }) {
  const { output } = await ai.generate({
    prompt: `Find official Portuguese statistics for: ${input.request}`,
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
    prompt: `Generate chart data for: ${input.request}`,
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
  return getMarketAnalysisFlow({ language: lang === 'en' ? 'English' : 'Portuguese' });
}
