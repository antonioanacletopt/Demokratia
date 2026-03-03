'use server';
/**
 * @fileOverview Server actions for Demokratia Portugal using Genkit v1.x.
 * 
 * handles AI-driven simulations, fact-checks, and analyses using a robust
 * approach to prevent "Unknown action type" errors in Next.js.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Singleton instance to prevent "Unknown action type" errors during Next.js HMR/reloads
// This ensures that the plugin and model registration is stable across Server Action calls.
const ai = (globalThis as any).__genkitAi ?? genkit({
  plugins: [
    googleAI({
      // Ensure the plugin picks up the correct API key from the environment
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
});

if (!(globalThis as any).__genkitAi) {
  (globalThis as any).__genkitAi = ai;
}

// Canonical model ID for Genkit 1.x with googleai plugin
const MODEL_ID = 'googleai/gemini-1.5-flash';

export type Language = 'en' | 'pt';

// --- Data Schemas (Zod) ---

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
    prompt: `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object matching the requested schema. Do not include markdown formatting or backticks.`,
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
    throw new Error('Falha na resposta estruturada da IA. Por favor, tente novamente.');
  }
}

// --- Exported Server Actions ---

export async function getIRSAssessment(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Atue como um consultor fiscal de elite em Portugal para o ano de 2026. Calcule o IRS para os seguintes dados: ${JSON.stringify(input)}. Forneça a resposta em ${langName}. Garanta precisão técnica de acordo com o CIRS 2026.`,
    IRSAssessmentOutputSchema
  );
}

export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Simule o impacto económico detalhado desta política proposta no contexto de Portugal 2026: ${input.policyDescription}. Idioma: ${langName}. Utilize a Lei de Okun e efeitos multiplicadores para as estimativas.`,
    EconomicPolicySimulationOutputSchema
  );
}

export async function getMarketAnalysis(lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Como Analista de Mercado Sénior, forneça um briefing estratégico para investidores em 2026. Analise eventos globais e o seu impacto em Energia, Defesa, Logística e Tecnologia em Portugal. Idioma: ${langName}.`,
    MarketAnalysisOutputSchema
  );
}

export async function getFactCheck(input: { claim: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Realize uma verificação de factos rigorosa sobre esta alegação relativa a Portugal em 2026: ${input.claim}. Idioma: ${langName}. Baseie o seu veredicto em dados estatísticos oficiais e no contexto temporal.`,
    FactCheckOutputSchema
  );
}

export async function getLegislationInfo(input: { question: string }, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Consulte a legislação portuguesa (Diário da República) para explicar: ${input.question}. Idioma: ${langName}. Foque-se nas regulamentações de 2026 e novas leis.`,
    ConsultLegislationOutputSchema
  );
}

export async function getScenarioAnalysis(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const schema = z.object({ feedback: z.string() });
  return generateStructuredData(
    `Analise este cenário macroeconómico para Portugal 2026: ${JSON.stringify(input)}. Atue como um membro do Conselho de Finanças Públicas. Idioma: ${langName}.`,
    schema
  );
}

export async function getFamilyBudgetAnalysis(input: any, lang: Language = 'pt') {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  return generateStructuredData(
    `Forneça coaching financeiro para este orçamento familiar em Portugal 2026: ${JSON.stringify(input)}. Idioma: ${langName}. Considere a inflação e o poder de compra médio.`,
    FamilyBudgetOutputSchema
  );
}

export async function getTranslation(text: string, lang: Language): Promise<string> {
  if (!text || lang === 'pt') return text;
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const response = await ai.generate({
    model: MODEL_ID,
    prompt: `Traduza o seguinte texto para ${langName}. Mantenha o tom profissional e garanta que termos técnicos democráticos/económicos são traduzidos corretamente: ${text}`,
  });
  return response.text || text;
}

export async function getNewsFeed() {
  return generateStructuredData(
    'Gere exatamente 5 itens de feed de notícias relevantes e oportunos para Portugal no ano de 2026. Categorias: Fact-Check, Nova Lei, Análise Económica. Use um tom formal e objetivo.',
    NewsFeedOutputSchema
  );
}

export async function getPublicStatistic(input: { request: string }) {
  return generateStructuredData(
    `Recupere dados estatísticos factuais oficiais de Portugal (INE/Pordata) para: ${input.request}.`,
    StatisticOutputSchema
  );
}

export async function getChartFromRequest(input: { request: string }) {
  return generateStructuredData(
    `Gere dados de séries numéricas para um gráfico com base neste pedido português: ${input.request}. Período: até 2026.`,
    ChartOutputSchema
  );
}
