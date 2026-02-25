
'use server';
/**
 * @fileOverview AI flow to analyze a family budget.
 * Provides financial health checks and savings tips based on Portugal 2026 context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeBudgetInputSchema = z.object({
  profile: z.object({
    adults: z.number(),
    children: z.number(),
    totalNetIncome: z.number(),
  }),
  expenses: z.record(z.number()),
  language: z.enum(['Portuguese', 'English']).default('Portuguese'),
});
export type AnalyzeBudgetInput = z.infer<typeof AnalyzeBudgetInputSchema>;

const AnalyzeBudgetOutputSchema = z.object({
  analysis: z.string().describe('Detailed financial health analysis.'),
  tips: z.array(z.string()).describe('Specific actionable savings tips.'),
  score: z.number().min(0).max(100).describe('Budget sustainability score.'),
});
export type AnalyzeBudgetOutput = z.infer<typeof AnalyzeBudgetOutputSchema>;

export async function analyzeFamilyBudget(input: AnalyzeBudgetInput): Promise<AnalyzeBudgetOutput> {
  return analyzeBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBudgetPrompt',
  input: { schema: AnalyzeBudgetInputSchema },
  output: { schema: AnalyzeBudgetOutputSchema },
  prompt: `Você é um consultor financeiro especializado na realidade portuguesa de 2026. 
Analise o seguinte orçamento familiar e forneça um parecer construtivo.

**PERFIL:**
- Adultos: {{profile.adults}}
- Dependentes: {{profile.children}}
- Rendimento Mensal Líquido: {{profile.totalNetIncome}}€

**DESPESAS:**
{{#each expenses}}
- {{@key}}: {{this}}€
{{/each}}

**INSTRUÇÕES:**
1. Compare as despesas com o custo de vida médio em Portugal (Março 2026).
2. Avalie a taxa de poupança (idealmente > 10%).
3. Identifique áreas de risco (ex: habitação a pesar mais de 35% do rendimento).
4. Dê 3 dicas práticas de poupança ou otimização fiscal (IRS).
5. O tom deve ser encorajador e pedagógico.
6. Escreva em {{language}}.

**ANÁLISE:**`,
});

const analyzeBudgetFlow = ai.defineFlow(
  {
    name: 'analyzeBudgetFlow',
    inputSchema: AnalyzeBudgetInputSchema,
    outputSchema: AnalyzeBudgetOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
