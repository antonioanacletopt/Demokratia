/**
 * @fileOverview This file implements a Genkit flow for consulting Portuguese legislation.
 *
 * - consultLegislation - A function that handles answering legal questions.
 * - ConsultLegislationInput - The input type for the function.
 * - ConsultLegislationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ConsultLegislationInputSchema = z.object({
  question: z.string().describe('A pergunta do utilizador sobre a legislação portuguesa.'),
  language: z.enum(['Portuguese', 'English']).default('Portuguese').describe('O idioma em que a resposta deve ser escrita.'),
});
export type ConsultLegislationInput = z.infer<typeof ConsultLegislationInputSchema>;

const ConsultLegislationOutputSchema = z.object({
  answer: z.string().describe('A resposta detalhada à pergunta, baseada na legislação em vigor.'),
  sources: z.array(z.string().url()).describe('Uma lista de URLs para as fontes oficiais da legislação (ex: Diário da República).'),
});
export type ConsultLegislationOutput = z.infer<typeof ConsultLegislationOutputSchema>;

export async function consultLegislation(input: ConsultLegislationInput): Promise<ConsultLegislationOutput> {
  return consultLegislationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'consultLegislationPrompt',
  input: { schema: ConsultLegislationInputSchema },
  output: { schema: ConsultLegislationOutputSchema },
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
  prompt: `Você é um assistente jurídico especialista em legislação portuguesa. A sua tarefa é responder a perguntas de utilizadores de forma clara, precisa e baseada estritamente na lei em vigor.

**IMPORTANTE: A sua resposta no campo 'answer' deve ser escrita obrigatoriamente em {{{language}}}.**

Fontes primárias de consulta:
- Diário da República Eletrónico (dre.pt)
- AIMA - Agência para a Integração, Migrações e Asilo (para questões de imigração e asilo)
- Legislação consolidada disponível em portais governamentais.
- Sites oficiais de entidades reguladoras.

Processo:
1.  Analise a pergunta do utilizador: {{{question}}}.
2.  Identifique a área do direito e a legislação aplicável (ex: Lei da Nacionalidade, Código do Trabalho, Lei de Estrangeiros, etc.).
3.  Formule uma resposta clara e objetiva no campo 'answer' em {{{language}}}. Evite jargão legal sempre que possível ou explique-o de forma simples. A resposta não deve ser um conselho legal, mas sim uma informação sobre o que a lei diz.
4.  No campo 'sources', liste os URLs diretos para os artigos de lei ou decretos-lei específicos que fundamentam a sua resposta.

Pergunta do Utilizador:
"{{{question}}}"
`,
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
