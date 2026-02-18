
/**
 * @fileOverview This file implements a Genkit flow for fact-checking claims
 * based on reliable public sources.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FactCheckInputSchema = z.object({
  claim: z.string().describe('The claim or statement to be fact-checked.'),
  language: z.enum(['Portuguese', 'English']).default('Portuguese').describe('The language for the output.'),
});
export type FactCheckInput = z.infer<typeof FactCheckInputSchema>;

const FactCheckOutputSchema = z.object({
  verdict: z.enum(['Verdadeiro', 'Falso', 'Enganador', 'Sem Evidência']).describe('The final verdict of the fact-check.'),
  explanation: z.string().describe('A detailed explanation supporting the verdict.'),
  sources: z.array(z.string()).describe('A list of URLs to the primary sources used.'),
});
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;

export async function factCheckClaim(input: FactCheckInput): Promise<FactCheckOutput> {
  return factCheckClaimFlow(input);
}

const prompt = ai.definePrompt({
  name: 'factCheckClaimPrompt',
  input: { schema: FactCheckInputSchema },
  output: { schema: FactCheckOutputSchema },
  prompt: `Você é um jornalista de verificação de factos (fact-checker) rigoroso focado na realidade portuguesa.

**IMPORTANTE: A sua resposta completa (explicação e veredicto) deve ser escrita em {{{language}}}.**

Alegação a verificar: "{{{claim}}}"

1. Use fontes oficiais (INE, Pordata, Diário da República) e imprensa de referência (Público, Expresso, SIC, RTP, etc.).
2. Analise o contexto económico e social atual.
3. Forneça um veredicto claro e uma explicação fundamentada.

Todos os campos de texto no JSON de saída devem estar em {{{language}}}.`,
});

const factCheckClaimFlow = ai.defineFlow(
  {
    name: 'factCheckClaimFlow',
    inputSchema: FactCheckInputSchema,
    outputSchema: FactCheckOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
