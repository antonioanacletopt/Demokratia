
/**
 * @fileOverview This file defines a Genkit flow for simulating the economic impact
 * of hypothetical policies on Portugal's economy. Updated for 2026 context.
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
        currentValue: z.number().describe('O valor atual do indicador (baseado em 2025/2026).'),
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
  prompt: `Você é um economista sénior especialista na economia de Portugal, operando em Março de 2026.

**REGRA DE OURO SOBRE DADOS:**
- Ignore dados antigos (2023 ou anterior) para o estado "Atual" dos indicadores.
- Use exclusivamente dados de execução de 2025 e as previsões oficiais do OE2026 (Orçamento do Estado 2026).
- Se não existirem dados reais para 2026, use estimativas fundamentadas e declare-as explicitamente como "Estimativas OE2026" ou "Projeções".

**REGRA DE OURO SOBRE LINGUAGEM:**
- O utilizador pode escrever com erros ortográficos ou gramaticais (ex: "heransa" em vez de "herança"). 
- A sua tarefa é interpretar o significado pretendido, corrigir silenciosamente esses erros na sua análise e produzir uma resposta gramaticalmente perfeita em {{{language}}}.

Analise a descrição da política:
"{{{policyDescription}}}"

1. Determine se é uma política real ou em debate em Portugal em 2025/2026.
2. Simule o impacto no PIB, Desemprego e Inflação usando modelos económicos modernos.
3. Forneça um raciocínio detalhado e técnico, mas acessível.
4. Se a política envolver habitação ou fiscalidade, considere o contexto das leis de 2025.

Todos os campos do JSON devem estar em {{{language}}}.`,
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
