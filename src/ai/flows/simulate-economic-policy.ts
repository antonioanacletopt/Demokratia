
/**
 * @fileOverview This file defines a Genkit flow for simulating the economic impact
 * of hypothetical policies on Portugal's economy.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EconomicPolicySimulationInputSchema = z.object({
  policyDescription: z
    .string()
    .describe('Uma descrição em linguagem natural de uma política económica hipotética ou real para Portugal.'),
  language: z.enum(['Portuguese', 'English']).default('Portuguese').describe('O idioma em que a resposta deve ser gerada.'),
});
export type EconomicPolicySimulationInput = z.infer<
  typeof EconomicPolicySimulationInputSchema
>;

const EconomicPolicySimulationOutputSchema = z.object({
  simulatedImpact: z
    .string()
    .describe('Um resumo geral do impacto económico simulado da política.'),
  keyIndicators: z
    .array(
      z.object({
        name: z.string().describe('O nome do indicador económico (ex: "Crescimento do PIB").'),
        currentValue: z.number().describe('O valor atual do indicador.'),
        projectedValue: z.number().describe('O valor projetado do indicador após a política.'),
        unit: z.string().describe('A unidade do indicador (ex: "%").'),
      })
    )
    .describe('Uma lista de indicadores económicos chave com os seus valores atuais e projetados.'),
  reasoning: z
    .string()
    .describe('Uma explicação detalhada do raciocínio por trás dos resultados projetados e seus mecanismos potenciais.'),
  isRealPolicy: z.boolean().describe('Indica se a política descrita é uma proposta real ou uma medida já implementada pelo governo.'),
  source: z.string().optional().describe('O link para a fonte oficial se a política for real.'),
});
export type EconomicPolicySimulationOutput = z.infer<
  typeof EconomicPolicySimulationOutputSchema
>;

export async function simulateEconomicPolicy(
  input: EconomicPolicySimulationInput
): Promise<EconomicPolicySimulationOutput> {
  return economicPolicySimulationFlow(input);
}

const economicPolicySimulationPrompt = ai.definePrompt({
  name: 'economicPolicySimulationPrompt',
  input: {schema: EconomicPolicySimulationInputSchema},
  output: {schema: EconomicPolicySimulationOutputSchema},
  prompt: `Você é um economista especialista com profundo conhecimento da economia portuguesa. A sua tarefa é simular os potenciais impactos económicos de uma política descrita pelo utilizador.

**IMPORTANTE: A sua resposta completa (textos, nomes de indicadores, explicações) deve ser escrita em {{{language}}}.**

Analise a descrição da política:
{{{policyDescription}}}

1. Determine se é uma política real em Portugal. Se sim, inclua a fonte.
2. Simule o impacto nos indicadores económicos (PIB, Desemprego, Inflação, etc.) usando modelos estabelecidos.
3. Forneça um raciocínio detalhado, mencionando a teoria económica utilizada.
4. Considere impactos em diferentes segmentos da sociedade.

Todos os campos de texto no JSON de saída devem estar em {{{language}}}.`,
});

const economicPolicySimulationFlow = ai.defineFlow(
  {
    name: 'economicPolicySimulationFlow',
    inputSchema: EconomicPolicySimulationInputSchema,
    outputSchema: EconomicPolicySimulationOutputSchema,
  },
  async input => {
    const {output} = await economicPolicySimulationPrompt(input);
    return output!;
  }
);
