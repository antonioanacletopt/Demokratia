/**
 * @fileOverview This file implements a Genkit flow for finding public statistics
 * based on a user's natural language request.
 *
 * - findPublicStatistic - A function that handles the search for statistical data.
 * - FindPublicStatisticInput - The input type for the findPublicStatistic function.
 * - FindPublicStatisticOutput - The return type for the findPublicStatistic function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindPublicStatisticInputSchema = z.object({
  request: z.string().describe('The user\'s natural language request for a specific statistic about Portugal.'),
});
export type FindPublicStatisticInput = z.infer<typeof FindPublicStatisticInputSchema>;

const FindPublicStatisticOutputSchema = z.object({
  isFound: z.boolean().describe('Indicates whether the requested statistic could be found from a reliable source.'),
  explanation: z.string().describe('A summary of the findings, or an explanation of why the data could not be found. If found, this should describe the data.'),
  source: z.string().optional().describe('The official source of the data if found (e.g., "INE, Censos 2021" or "DGO, OE 2024").'),
  data: z.string().optional().describe('The structured data, if found, as a JSON string. Should be formatted to be easily parseable into a table.'),
});
export type FindPublicStatisticOutput = z.infer<typeof FindPublicStatisticOutputSchema>;

export async function findPublicStatistic(input: FindPublicStatisticInput): Promise<FindPublicStatisticOutput> {
  return findPublicStatisticFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findPublicStatisticPrompt',
  input: { schema: FindPublicStatisticInputSchema },
  output: { schema: FindPublicStatisticOutputSchema },
  prompt: `Você é um analista de dados especialista em dados públicos portugueses. A sua tarefa é encontrar uma estatística específica baseada no pedido do utilizador e apresentá-la de forma clara. Toda a sua resposta deve ser em Português.

Pesquise a estatística solicitada exclusivamente em fontes públicas fidedignas:
- INE (Instituto Nacional de Estatística)
- Pordata
- Banco de Portugal
- Eurostat
- DGO (Direção-Geral do Orçamento) - Use esta fonte para questões sobre o Orçamento do Estado (OE), gastos públicos e investimentos.
- Portal da Transparência (transparencia.gov.pt)

Diretrizes:
- Se encontrar os dados:
  - Defina 'isFound' como true.
  - Em 'explanation', forneça um resumo breve e claro do que os dados representam.
  - Em 'source', cite a fonte específica (ex: 'DGO, Orçamento do Estado 2024').
  - Em 'data', forneça os dados brutos formatados como uma string JSON representando um array de objetos, adequados para exibição numa tabela.

- Se não encontrar os dados:
  - Defina 'isFound' como false.
  - Em 'explanation', explique claramente por que os dados não foram encontrados e sugira fontes alternativas se possível.
  - Deixe 'source' e 'data' vazios.

Pedido do Utilizador:
"{{{request}}}"
`,
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