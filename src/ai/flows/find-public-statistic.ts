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

REGRAS CRÍTICAS DE QUALIDADE:
1. **CONTEXTO HISTÓRICO:** Se o utilizador perguntar por um dado de um ano específico (ex: 2025 ou 2026), tente SEMPRE fornecer uma série temporal incluindo os últimos 3 a 5 anos para comparação. Dados isolados são pouco informativos.
2. **NOMES DE COLUNAS:** Use chaves de JSON (nomes de colunas) curtas, claras e em português humano (ex: "Ano", "Preço Médio", "Variação %"). NUNCA use identificadores técnicos com underscores longos ou maiúsculas técnicas.
3. Priorize dados do OE2026 e execução orçamental.
4. Se encontrar os dados, forneça-os no campo 'data' como um array JSON de objetos (ex: [{"Ano": 2024, "Valor": 45}, {"Ano": 2025, "Valor": 50}]).
5. Cite a fonte oficial exata no campo 'source'.
6. Se o dado for uma previsão governamental, identifique-a como tal.

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
