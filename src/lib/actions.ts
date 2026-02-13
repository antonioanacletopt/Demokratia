'use server';

import {
  simulateEconomicPolicy,
  EconomicPolicySimulationInput,
  EconomicPolicySimulationOutput,
} from '@/ai/flows/simulate-economic-policy';
import {
  explainPublicDataInsights,
  ExplainPublicDataInsightsInput,
  ExplainPublicDataInsightsOutput,
} from '@/ai/flows/explain-public-data-insights';

export async function getEconomicSimulation(
  input: EconomicPolicySimulationInput
): Promise<EconomicPolicySimulationOutput> {
  return await simulateEconomicPolicy(input);
}

export async function getDataExplanation(
  input: ExplainPublicDataInsightsInput
): Promise<ExplainPublicDataInsightsOutput> {
  return await explainPublicDataInsights(input);
}
