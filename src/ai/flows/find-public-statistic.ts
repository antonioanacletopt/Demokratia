/**
 * @fileOverview Flow for finding public statistics. Context: 2026.
 * Instructs the AI to provide structured data for tables.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindPublicStatisticInputSchema = z.object({
  request: z.string().describe('The user\'s natural language request.'),
});
export type FindPublicStatisticInput = z.infer<typeof FindPublicStatisticInputSchema>;

const FindPublicStatisticOutputSchema = z.object({
  isFound: z.boolean().describe('Indicates if the requested statistic was found.'),
  explanation: z.string().describe('A clear text summary of the findings.'),
  source: z.string().optional().describe('The official source of the data.'),
  data: z.string().optional().describe('The statistical data strictly formatted as a JSON array of objects for table display.'),
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

**INSTRUÇÕES OBRIGATÓRIAS:**
1. Se encontrar os dados, defina 'isFound' como true.
2. Forneça uma explicação detalhada e profissional no campo 'explanation'.
3. **No campo 'data', forneça os dados numéricos formatados estritamente como uma string JSON contendo um array de objetos (ex: [{"Ano": 2025, "Valor": 61, "Posição": 30}]).** Estes dados serão usados para gerar automaticamente uma tabela na interface. Se não houver dados tabulares, deixe vazio.
4. Use o campo 'source' para citar a fonte oficial (ex: INE, Transparency International, Pordata).

CONTEXTO ATUAL (2026):
- O Orçamento do Estado em vigor é o OE2026.
- A economia cresceu 2.1% em 2025.
- A inflação estabilizou nos 2% no início de 2026.
- O foco atual do governo está no PRR 2.0 e Habitação Social.

Pedido do Utilizador: "{{{request}}}"`,
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
