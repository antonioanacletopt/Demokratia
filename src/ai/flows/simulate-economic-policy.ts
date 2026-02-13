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
    .describe('A natural language description of a hypothetical economic policy for Portugal.'),
});
export type EconomicPolicySimulationInput = z.infer<
  typeof EconomicPolicySimulationInputSchema
>;

const EconomicPolicySimulationOutputSchema = z.object({
  simulatedImpact: z
    .string()
    .describe('An overall summary of the simulated economic impact of the policy.'),
  keyIndicators: z
    .array(
      z.object({
        name: z.string().describe('The name of the economic indicator (e.g., "GDP Growth").'),
        currentValue: z.number().describe('The current value of the indicator.'),
        projectedValue: z.number().describe('The projected value of the indicator after the policy.'),
        unit: z.string().describe('The unit of the indicator (e.g., "%").'),
      })
    )
    .describe('A list of key economic indicators with their current and projected values.'),
  reasoning: z
    .string()
    .describe('A detailed explanation of the reasoning behind the projected outcomes and their potential mechanisms.'),
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
  prompt: `You are an expert economist with deep knowledge of the Portuguese economy and access to a vast database of economic data and models. Your task is to simulate the potential economic impacts of a hypothetical policy described by the user.

Analyze the provided policy description and generate a data-informed simulation of its effects on key economic indicators for Portugal. Provide concrete projected values for these indicators, along with a detailed explanation of your reasoning.


Economic Policy Description:
{{{policyDescription}}}


Based on the above policy, simulate its impact on the Portuguese economy. Ensure the output strictly adheres to the JSON schema, including an overall summary, a list of key economic indicators with current and projected values (use plausible current values for Portugal), and a comprehensive explanation of the economic reasoning.`,
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
