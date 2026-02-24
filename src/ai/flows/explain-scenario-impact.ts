
'use server';
/**
 * @fileOverview AI flow to analyze and explain a user-created macroeconomic scenario.
 * Updated to handle new parameters: IRC, SMN, Public Debt and Budget Balance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeScenarioInputSchema = z.object({
  parameters: z.object({
    irs: z.number(),
    iva: z.number(),
    irc: z.number(),
    investment: z.number(),
    smn: z.number(),
  }),
  results: z.object({
    gdp: z.number(),
    unemployment: z.number(),
    inflation: z.number(),
    debt: z.number(),
    balance: z.number(),
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

**DADOS DO CENÁRIO (POLÍTICAS):**
- Taxa Média IRS: {{parameters.irs}}%
- Taxa Média IVA: {{parameters.iva}}%
- Taxa IRC: {{parameters.irc}}%
- Investimento Público: {{parameters.investment}}% do PIB
- Salário Mínimo Nacional (SMN): {{parameters.smn}}€

**PROJEÇÕES DE RESULTADO:**
- Crescimento PIB: {{results.gdp}}%
- Desemprego: {{results.unemployment}}%
- Inflação: {{results.inflation}}%
- Dívida Pública: {{results.debt}}% do PIB
- Saldo Orçamental: {{results.balance}}% do PIB (Positivo = Superávit, Negativo = Défice)

**INSTRUÇÕES DE ANÁLISE:**
1. Avalie a **Consistência Orçamental**: Baixar impostos (IRS/IVA/IRC) e subir o SMN/Investimento simultaneamente gera um défice perigoso?
2. Avalie a **Competitividade**: Como é que a alteração do IRC e SMN afeta a atração de empresas e o emprego.
3. Explique os mecanismos (ex: Curva de Laffer se os impostos baixarem muito, ou efeito multiplicador do investimento).
4. Use um tom profissional, pedagógico e neutro.
5. Escreva obrigatoriamente em {{language}}.

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
