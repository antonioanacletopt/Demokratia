/**
 * @fileOverview This file implements a Genkit flow for generating chart data
 * from a natural language user request about public data.
 *
 * - generateChartFromRequest - A function that handles the chart data generation.
 * - GenerateChartInput - The input type for the function.
 * - GenerateChartOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateChartInputSchema = z.object({
  request: z.string().describe("A user's natural language request for a chart about public data in Portugal."),
});
export type GenerateChartInput = z.infer<typeof GenerateChartInputSchema>;

const GenerateChartOutputSchema = z.object({
  isChartable: z.boolean().describe('Indicates if a chart can be generated from the data.'),
  explanation: z.string().describe('A summary of the findings or an explanation of why the data could not be charted.'),
  chartData: z.array(z.object({
    label: z.union([z.string(), z.number()]).describe('The label for the data point (e.g., year, category).'),
    value: z.number().describe('The numerical value for the data point.'),
  })).optional().describe('The data formatted for charting.'),
  chartType: z.enum(['bar', 'line']).optional().describe("The suggested chart type."),
  chartTitle: z.string().optional().describe('A descriptive title for the chart.'),
  yAxisLabel: z.string().optional().describe('The label for the Y-axis, including units.'),
});
export type GenerateChartOutput = z.infer<typeof GenerateChartOutputSchema>;

export async function generateChartFromRequest(input: GenerateChartInput): Promise<GenerateChartOutput> {
  return generateChartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChartPrompt',
  input: { schema: GenerateChartInputSchema },
  output: { schema: GenerateChartOutputSchema },
  prompt: `You are an expert data analyst and economist specializing in Portuguese public data. Your task is to generate data for a chart based on a user's natural language request. Your entire response must be in Portuguese.

Search for the requested data from reliable public sources only (INE, Pordata, Banco de Portugal, Eurostat, etc.).

**REGRAS CRÍTICAS PARA GRÁFICOS:**
1. **CONTEXTO HISTÓRICO:** Se o pedido referir um ano específico (ex: 2025), tente sempre encontrar dados dos últimos 3 a 5 anos para fornecer contexto e permitir a visualização de tendências. Um gráfico com apenas uma barra ou um ponto não é útil.
2. **TÍTULOS E LEGENDAS:** Use títulos curtos e profissionais em português.

- If you find suitable data and it can be visualized:
  - Set 'isChartable' to true.
  - In 'explanation', provide a brief, clear summary of what the data represents and the source. Inclua uma breve análise da tendência observada (ex: "Os dados revelam uma estabilização após o pico de 2023").
  - In 'chartData', provide the data formatted as a JSON array of objects with 'label' (for the X-axis, e.g., year) and 'value' (for the Y-axis). The data should be ordered chronologically or logically.
  - In 'chartType', suggest 'bar' for comparisons or 'line' for time-series data.
  - In 'chartTitle', create a descriptive title for the chart.
  - In 'yAxisLabel', specify the unit of the data (e.g., '%', '€', 'milhões').

- If you cannot find the data or it's not suitable for a simple chart:
  - Set 'isChartable' to false.
  - In 'explanation', clearly explain why the data could not be found or visualized.
  - Leave the other fields empty.

User's Request:
"{{{request}}}"
`,
});

const generateChartFlow = ai.defineFlow(
  {
    name: 'generateChartFlow',
    inputSchema: GenerateChartInputSchema,
    outputSchema: GenerateChartOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
