'use server';

/**
 * @fileOverview O Cérebro Único da Demokratia.
 * Centraliza todas as Server Actions e integração com Genkit.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { Language } from './i18n';

const ai = genkit({
  plugins: [googleAI()],
});

const MODEL_ID = 'googleai/gemini-1.5-flash';

// --- Schemas ---

export const FactCheckOutputSchema = z.object({
  verdict: z.enum(['Verdadeiro', 'Falso', 'Enganador', 'Sem Evidência']),
  explanation: z.string(),
  sources: z.array(z.string().url()),
});
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;

export const EconomicSimulationOutputSchema = z.object({
  simulatedImpact: z.string(),
  reasoning: z.string(),
  isRealPolicy: z.boolean(),
  source: z.string().url().optional(),
  keyIndicators: z.array(z.object({
    name: z.string(),
    currentValue: z.number(),
    projectedValue: z.number(),
    unit: z.string(),
  })),
});
export type EconomicSimulationOutput = z.infer<typeof EconomicSimulationOutputSchema>;

// --- Actions ---

/**
 * Tradução de texto via IA com cache implícito.
 */
export async function getTranslation(text: string, lang: Language) {
  const target = lang === 'en' ? 'English' : 'Portuguese';
  const { text: translated } = await ai.generate({
    model: MODEL_ID,
    prompt: `Translate the following text to ${target}. Maintain the tone and technical terms: ${text}`,
  });
  return translated;
}

/**
 * Análise de simulação de políticas económicas.
 */
export async function getEconomicSimulation(input: { policyDescription: string }, lang: Language = 'pt'): Promise<EconomicSimulationOutput> {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Analyze the economic impact of the following policy in Portugal for 2026: "${input.policyDescription}". 
    Identify if it's a real proposal. Provide projections for GDP, Employment and Debt. Language: ${langName}.`,
    output: { schema: EconomicSimulationOutputSchema },
  });
  return output!;
}

/**
 * Verificação de factos (Fact-Check).
 */
export async function getFactCheck(input: { claim: string }, lang: Language = 'pt'): Promise<FactCheckOutput> {
  const langName = lang === 'en' ? 'English' : 'Portuguese';
  const { output } = await ai.generate({
    model: MODEL_ID,
    prompt: `Verify the following claim regarding Portugal: "${input.claim}". Use official sources (INE, Pordata, DRE). Provide a verdict and clear explanation. Language: ${langName}.`,
    output: { schema: FactCheckOutputSchema },
  });
  return output!;
}

// ... outras ações consolidadas aqui ...
