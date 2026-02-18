
'use server';
/**
 * @fileOverview A content translation AI agent.
 *
 * - translateContent - A function that handles text translation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateContentInputSchema = z.object({
  text: z.string().describe('O texto original a traduzir.'),
  targetLanguage: z.enum(['Portuguese', 'English']).describe('O idioma de destino.'),
});
export type TranslateContentInput = z.infer<typeof TranslateContentInputSchema>;

const TranslateContentOutputSchema = z.object({
  translatedText: z.string().describe('O texto traduzido.'),
});
export type TranslateContentOutput = z.infer<typeof TranslateContentOutputSchema>;

export async function translateContent(input: TranslateContentInput): Promise<TranslateContentOutput> {
  return translateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateContentPrompt',
  input: { schema: TranslateContentInputSchema },
  output: { schema: TranslateContentOutputSchema },
  prompt: `Você é um tradutor especializado no panorama político e económico português. 
A sua tarefa é traduzir o seguinte texto para {{{targetLanguage}}}, mantendo o tom profissional e a precisão técnica dos termos.

Texto Original:
"{{{text}}}"

Tradução:`,
});

const translateContentFlow = ai.defineFlow(
  {
    name: 'translateContentFlow',
    inputSchema: TranslateContentInputSchema,
    outputSchema: TranslateContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
