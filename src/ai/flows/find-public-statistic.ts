/**
 * @fileOverview Flow for finding public statistics. Context: 2026.
 * Focado em fontes governamentais e bases de dados públicas portuguesas.
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
  data: z.string().optional().describe('The statistical data formatted as a JSON array of objects.'),
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
A sua tarefa é encontrar uma estatística real baseada no pedido do utilizador.

FONTES OBRIGATÓRIAS (Consulte estas bases de dados):
- INE (Instituto Nacional de Estatística)
- Pordata (Fundação Francisco Manuel dos Santos)
- DGO (Direção-Geral do Orçamento) - dgo.gov.pt
- Portal da Transparência (transparencia.gov.pt)
- Banco de Portugal
- DRE (Diário da República Eletrónico)

REGRAS:
1. Priorize dados do OE2026 e execução orçamental.
2. Se encontrar os dados, forneça-os no campo 'data' como um array JSON de objetos (ex: [{"Ano": 2026, "Valor": 50}]).
3. Cite a fonte oficial exata no campo 'source'.
4. Se o dado for uma previsão governamental, identifique-a como tal.

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
