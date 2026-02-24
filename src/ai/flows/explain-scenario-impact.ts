
'use server';
/**
 * @fileOverview AI flow to analyze and explain a user-created macroeconomic scenario.
 *
 * - analyzeScenario - Function to handle the analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeScenarioInputSchema = z.object({
  parameters: z.object({
    irs: z.number(),
    iva: z.number(),
    investment: z.number(),
  }),
  results: z.object({
    gdp: z.number(),
    unemployment: z.number(),
    inflation: z.number(),
  }),
  language: z.enum(['Portuguese', 'English']).default('Portuguese'),
});
export type AnalyzeScenarioInput = z.infer<typeof AnalyzeScenarioInputSchema>;

const AnalyzeScenarioOutputSchema = z.object({
  feedback: z.string().describe('Detailed AI feedback on the economic sustainability and impacts of the scenario.'),
});
export type AnalyzeScenarioOutput = z.infer<typeof AnalyzeScenarioOutputSchema>;

export async function analyzeScenario(input: AnalyzeScenarioInput): Promise<AnalyzeScenarioOutput> {
  return analyzeScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeScenarioPrompt',
  input: { schema: AnalyzeScenarioInputSchema },
  output: { schema: AnalyzeScenarioOutputSchema },
  prompt: `Você é um analista sénior do Conselho de Finanças Públicas de Portugal. 
Sua tarefa é analisar criticamente um cenário macroeconómico hipotético criado por um cidadão para o ano de 2026.

**DADOS DO CENÁRIO:**
- Ajuste de IRS: {{parameters.irs}}% (Face à média atual)
- Ajuste de IVA: {{parameters.iva}}% (Face à média atual)
- Investimento Público: {{parameters.investment}}% do PIB
- Resultado PIB Projetado: {{results.gdp}}%
- Resultado Desemprego: {{results.unemployment}}%
- Resultado Inflação: {{results.inflation}}%

**INSTRUÇÕES:**
1. Avalie se o cenário é sustentável (ex: baixar todos os impostos e subir investimento causa défice excessivo).
2. Explique os mecanismos económicos em jogo (ex: efeito multiplicador do investimento vs pressão inflacionista).
3. Seja pedagógico e neutro. Use um tom profissional.
4. Escreva a sua análise obrigatoriamente em {{language}}.

**ANÁLISE:**`,
});

const analyzeScenarioFlow = ai.defineFlow(
  {
    name: 'analyzeScenarioFlow',
    inputSchema: AnalyzeScenarioInputSchema,
    outputSchema: AnalyzeScenarioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
