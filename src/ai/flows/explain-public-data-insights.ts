'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating insights and explanations
 * from public economic data based on natural language questions.
 *
 * - explainPublicDataInsights - A function that handles the generation of explanations.
 * - ExplainPublicDataInsightsInput - The input type for the explainPublicDataInsights function.
 * - ExplainPublicDataInsightsOutput - The return type for the explainPublicDataInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainPublicDataInsightsInputSchema = z.object({
  question: z.string().describe('The natural language question about the public economic data.'),
  contextData: z.string().describe('The relevant public economic data in a structured format (e.g., JSON, CSV, or plain text) that the AI should analyze.'),
});
export type ExplainPublicDataInsightsInput = z.infer<typeof ExplainPublicDataInsightsInputSchema>;

const ExplainPublicDataInsightsOutputSchema = z.object({
  explanation: z.string().describe('A concise, AI-generated summary or explanation highlighting key insights and correlations from the provided data.'),
});
export type ExplainPublicDataInsightsOutput = z.infer<typeof ExplainPublicDataInsightsOutputSchema>;

export async function explainPublicDataInsights(input: ExplainPublicDataInsightsInput): Promise<ExplainPublicDataInsightsOutput> {
  return explainPublicDataInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainPublicDataInsightsPrompt',
  input: { schema: ExplainPublicDataInsightsInputSchema },
  output: { schema: ExplainPublicDataInsightsOutputSchema },
  prompt: `You are an expert economic analyst. Your task is to provide a concise, AI-generated summary or explanation based on the provided public economic data.

Highlight key insights, trends, and correlations relevant to the user's question. Focus on clarity and ease of understanding for someone exploring complex information.

User's Question: {{{question}}}

Relevant Public Economic Data:
{{{contextData}}}

Your Explanation:`,
});

const explainPublicDataInsightsFlow = ai.defineFlow(
  {
    name: 'explainPublicDataInsightsFlow',
    inputSchema: ExplainPublicDataInsightsInputSchema,
    outputSchema: ExplainPublicDataInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
