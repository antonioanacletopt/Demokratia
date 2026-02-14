'use server';
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
  source: z.string().optional().describe('The official source of the data if found (e.g., "INE, Censos 2021").'),
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
  prompt: `You are an expert data analyst specializing in Portuguese public data. Your task is to find a specific statistic based on the user's request and present it clearly. Your entire response must be in Portuguese.

Search for the requested statistic from reliable public sources only, such as INE, Pordata, Banco de Portugal, Eurostat, and official government reports.

- If you find the data:
  - Set 'isFound' to true.
  - In 'explanation', provide a brief, clear summary of what the data represents.
  - In 'source', cite the specific source (e.g., 'INE, Contas Nacionais Trimestrais').
  - In 'data', provide the raw data formatted as a JSON string representing an array of objects, suitable for displaying in a table.

- If you cannot find the data:
  - Set 'isFound' to false.
  - In 'explanation', clearly explain why the data could not be found (e.g., it's not publicly available, it's too specific, or not collected by official bodies) and suggest that the user could propose a reliable source if they know one.
  - Leave 'source' and 'data' empty.

User's Request:
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
