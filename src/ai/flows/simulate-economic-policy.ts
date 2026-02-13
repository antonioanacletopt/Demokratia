'use server';
/**
 * @fileOverview This file defines a Genkit flow for simulating the economic impact
 * of hypothetical policies on Portugal's economy.
 *
 * - simulateEconomicPolicy - A function that handles the economic policy simulation process.
 * - EconomicPolicySimulationInput - The input type for the simulateEconomicPolicy function.
 * - EconomicPolicySimulationOutput - The return type for the simulateEconomicPolicy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EconomicPolicySimulationInputSchema = z.object({
  policyDescription: z
    .string()
    .describe('Uma descrição em linguagem natural de uma política económica hipotética para Portugal.'),
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
  prompt: `Você é um economista especialista com profundo conhecimento da economia portuguesa e acesso a uma vasta base de dados e modelos económicos. A sua tarefa é simular os potenciais impactos económicos de uma política hipotética descrita pelo utilizador, baseando-se em teorias económicas reconhecidas. A sua resposta deve ser inteiramente em português.

Analise a descrição da política fornecida e gere uma simulação informada por dados dos seus efeitos nos principais indicadores económicos de Portugal. Para a sua análise, utilize um ou mais modelos económicos estabelecidos (ex: Keynesiano, Clássico, Monetarista, etc.).

Descrição da Política Económica:
{{{policyDescription}}}

Com base na política acima, simule o seu impacto na economia portuguesa. Garanta que o resultado adere estritamente ao esquema JSON. No campo 'reasoning', explique detalhadamente o seu raciocínio, os mecanismos de impacto, e **mencione explicitamente qual o modelo ou teoria económica principal que usou para chegar a essa conclusão e porquê**. Forneça um resumo geral, e uma lista de indicadores económicos chave com valores atuais e projetados (use valores atuais plausíveis para Portugal). Toda a saída deve ser em português.`,
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
