'use server';
/**
 * @fileOverview Server actions for Demokratia Portugal using Genkit v1.x.
 * 
 * Estabilização do motor de IA utilizando acções registadas (Flows) para garantir
 * que o plugin googleai e o modelo Gemini são correctamente mapeados no ambiente Next.js.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Inicialização centralizada do Genkit
const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
    }),
  ],
});

// Identificador canónico do modelo para o plugin googleai
const MODEL_ID = 'googleai/gemini-1.5-flash';

export type Language = 'en' | 'pt';

// --- Esquemas de Dados ---

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

// --- Definição de Flows (Garante o registo das acções no servidor) ---

const irsFlow = ai.defineFlow({ name: 'irsFlow', inputSchema: z.object({ input: z.any(), langName: z.string() }) }, async (i) => {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Act as an elite tax consultant in Portugal for 2026. Calculate IRS for the following data: ${JSON.stringify(i.input)}. Provide response in ${i.langName}. Ensure technical accuracy according to CIRS 2026.`,
    output: { schema: IRSAssessmentOutputSchema },
  });
  return output!;
});

const economicSimulationFlow = ai.defineFlow({ name: 'economicSimulationFlow', inputSchema: z.object({ policyDescription: z.string(), langName: z.string() }) }, async (i) => {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Simulate the detailed economic impact of this proposed policy in the context of Portugal 2026: ${i.policyDescription}. Language: ${i.langName}. Use Okun's Law and multiplier effects for estimations.`,
    output: { schema: EconomicPolicySimulationOutputSchema },
  });
  return output!;
});

const marketAnalysisFlow = ai.defineFlow({ name: 'marketAnalysisFlow', inputSchema: z.object({ langName: z.string() }) }, async (i) => {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `As a Senior Market Analyst, provide a strategic briefing for investors in 2026. Analyze global events and their impact on Energy, Defense, Logistics, and Tech in Portugal. Language: ${i.langName}.`,
    output: { schema: MarketAnalysisOutputSchema },
  });
  return output!;
});

const factCheckFlow = ai.defineFlow({ name: 'factCheckFlow', inputSchema: z.object({ claim: z.string(), langName: z.string() }) }, async (i) => {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Perform a rigorous fact-check on this claim regarding Portugal in 2026: ${i.claim}. Language: ${i.langName}. Base your verdict on official statistical data and temporal context.`,
    output: { schema: FactCheckOutputSchema },
  });
  return output!;
});

const legislationFlow = ai.defineFlow({ name: 'legislationFlow', inputSchema: z.object({ question: z.string(), langName: z.string() }) }, async (i) => {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Consult Portuguese legislation (Diário da República) to explain: ${i.question}. Language: ${i.langName}. Focus on 2026 regulations and new laws.`,
    output: { schema: ConsultLegislationOutputSchema },
  });
  return output!;
});

const scenarioAnalysisFlow = ai.defineFlow({ name: 'scenarioAnalysisFlow', inputSchema: z.object({ input: z.any(), langName: z.string() }) }, async (i) => {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Analyze this macroeconomic scenario for Portugal 2026: ${JSON.stringify(i.input)}. Act as a member of the Public Finance Council. Language: ${i.langName}.`,
    output: { schema: z.object({ feedback: z.string() }) },
  });
  return output!;
});

const familyBudgetFlow = ai.defineFlow({ name: 'familyBudgetFlow', inputSchema: z.object({ input: z.any(), langName: z.string() }) }, async (i) => {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Provide financial coaching for this family budget in Portugal 2026: ${JSON.stringify(i.input)}. Language: ${i.langName}. Consider inflation and average purchasing power.`,
    output: { schema: FamilyBudgetOutputSchema },
  });
  return output!;
});

const translationFlow = ai.defineFlow({ name: 'translationFlow', inputSchema: z.object({ text: z.string(), langName: z.string() }) }, async (i) => {
  const { text: resultText } = await ai.generate({
    model: MODEL_ID,
    prompt: `Translate the following text to ${i.langName}. Maintain the professional tone and ensure technical democratic/economic terms are translated correctly: ${i.text}`,
  });
  return resultText || i.text;
});

const newsFeedFlow = ai.defineFlow({ name: 'newsFeedFlow' }, async () => {
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
      })
    },
  });
  return output!;
});

const publicStatisticFlow = ai.defineFlow({ name: 'publicStatisticFlow', inputSchema: z.object({ request: z.string() }) }, async (i) => {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Retrieve official factual statistical data from Portugal (INE/Pordata) for: ${i.request}.`,
    output: { schema: StatisticOutputSchema },
  });
  return output!;
});

const chartRequestFlow = ai.defineFlow({ name: 'chartRequestFlow', inputSchema: z.object({ request: z.string() }) }, async (i) => {
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Generate numeric series data for a chart based on this Portuguese request: ${i.request}. Period: up to 2026.`,
    output: { schema: ChartOutputSchema },
  });
  return output!;
});

// --- Server Actions Exportadas (Wrappers) ---

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  return irsFlow({ input, langName: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  return economicSimulationFlow({ policyDescription: input.policyDescription, langName: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  return marketAnalysisFlow({ langName: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  return factCheckFlow({ claim: input.claim, langName: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  return legislationFlow({ question: input.question, langName: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  return scenarioAnalysisFlow({ input, langName: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  return familyBudgetFlow({ input, langName: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  return translationFlow({ text, langName: lang === 'en' ? 'English' : 'Portuguese' });
}

export async function getNewsFeed() {
  return newsFeedFlow();
}

export async function getPublicStatistic(input: { request: string }) {
  return publicStatisticFlow({ request: input.request });
}

export async function getChartFromRequest(input: { request: string }) {
  return chartRequestFlow({ request: input.request });
}
