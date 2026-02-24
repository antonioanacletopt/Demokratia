
/**
 * @fileOverview This file implements a Genkit flow for consulting Portuguese legislation.
 * Updated for latest laws (2025/2026) and input correction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ConsultLegislationInputSchema = z.object({
  question: z.string().describe('A pergunta do utilizador sobre a legislação portuguesa.'),
  language: z.enum(['Portuguese', 'English']).default('Portuguese').describe('O idioma da resposta.'),
});
export type ConsultLegislationInput = z.infer<typeof ConsultLegislationInputSchema>;

const ConsultLegislationOutputSchema = z.object({
  answer: z.string().describe('A resposta detalhada baseada na lei em vigor em 2026.'),
  sources: z.array(z.string().url()).describe('URLs oficiais (dre.pt).'),
});
export type ConsultLegislationOutput = z.infer<typeof ConsultLegislationOutputSchema>;

export async function consultLegislation(input: ConsultLegislationInput): Promise<ConsultLegislationOutput> {
  return consultLegislationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'consultLegislationPrompt',
  input: { schema: ConsultLegislationInputSchema },
  output: { schema: ConsultLegislationOutputSchema },
  prompt: `Você é um assistente jurídico especialista na legislação portuguesa atualizada a Março de 2026.

**RIGOR E CORREÇÃO:**
- O utilizador pode escrever com erros (ex: "leis de imigrasao"). Interprete corretamente e responda com perfeição gramatical em {{{language}}}.
- Ignore leis revogadas. Foque-se na legislação consolidada e nas alterações publicadas no Diário da República em 2024 e 2025.
- Se a pergunta for sobre heranças ou imóveis (burocracia), use os dados mais recentes de simplificação administrativa de 2025/2026.

Pergunta: "{{{question}}}"

A resposta no campo 'answer' deve estar em {{{language}}}.`,
});

const consultLegislationFlow = ai.defineFlow(
  {
    name: 'consultLegislationFlow',
    inputSchema: ConsultLegislationInputSchema,
    outputSchema: ConsultLegislationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
