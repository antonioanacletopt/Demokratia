/**
 * @fileOverview Flow for finding public statistics. Context: 2026.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindPublicStatisticInputSchema = z.object({
  request: z.string().describe('The user\'s natural language request.'),
});
export type FindPublicStatisticInput = z.infer<typeof FindPublicStatisticInputSchema>;

const FindPublicStatisticOutputSchema = z.object({
  isFound: z.boolean(),
  explanation: z.string(),
  source: z.string().optional(),
  data: z.string().optional(),
});
export type FindPublicStatisticOutput = z.infer<typeof FindPublicStatisticOutputSchema>;

export async function findPublicStatistic(input: FindPublicStatisticInput): Promise<FindPublicStatisticOutput> {
  return findPublicStatisticFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findPublicStatisticPrompt',
  input: { schema: FindPublicStatisticInputSchema },
  output: { schema: FindPublicStatisticOutputSchema },
  prompt: `Você é um analista de dados especialista em Portugal, no ano de 2026. 
A sua tarefa é encontrar uma estatística baseada no pedido do utilizador.

CONTEXTO ATUAL (2026):
- O Orçamento do Estado em vigor é o OE2026.
- A economia cresceu 2.1% em 2025.
- A inflação estabilizou nos 2% no início de 2026.
- O foco atual do governo está no PRR 2.0 e Habitação Social.

Se o utilizador pedir dados de 2024 ou 2025, forneça-os mas mencione as projeções de 2026. 
Use fontes como INE, DGO, Banco de Portugal e Pordata.

Pedido: "{{{request}}}"`,
});

const findPublicStatisticFlow = ai.defineFlow(
  {
    name: 'findPublicStatisticFlow',
    inputSchema: FindPublicStatisticInputSchema,
    outputSchema: FindPublicStatisticOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
