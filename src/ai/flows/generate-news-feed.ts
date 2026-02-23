'use server';
/**
 * @fileOverview A news feed generation AI agent. Updated for 2026.
 * Ensures every item has an action link with proper human-readable titles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FeedItemSchema = z.object({
  id: z.string().describe('Um identificador único para o item de feed.'),
  type: z.enum(['Alegação', 'Nova Lei', 'Análise']).describe('O tipo de notícia.'),
  title: z.string().describe('O título da notícia.'),
  source: z.string().describe('A fonte da notícia (ex: "Governo", "Deputado X", "INE").'),
  date: z.string().describe('A data da notícia no formato AAAA-MM-DD.'),
  description: z.string().describe('Uma breve descrição da notícia.'),
  actionLink: z.object({
    href: z.string().describe('O URL para a ação relacionada.'),
    label: z.string().describe('O texto para o botão de ação.')
  }).describe('Uma ação obrigatória: simulação para alegações, análise para leis, dados para análise.')
});

export type FeedItem = z.infer<typeof FeedItemSchema>;

const GenerateNewsFeedOutputSchema = z.object({
  feedItems: z.array(FeedItemSchema).min(4).max(5)
});
export type GenerateNewsFeedOutput = z.infer<typeof GenerateNewsFeedOutputSchema>;

export async function generateNewsFeed(): Promise<GenerateNewsFeedOutput> {
  return generateNewsFeedFlow();
}

const prompt = ai.definePrompt({
  name: 'generateNewsFeedPrompt',
  output: { schema: GenerateNewsFeedOutputSchema },
  prompt: `Você é um analista político e económico experiente, focado na atualidade portuguesa no ano de 2026. 
A sua tarefa é gerar uma lista de 4 a 5 notícias recentes e relevantes considerando que estamos em Março de 2026.

REGRAS CRÍTICAS PARA OS LINKS DE AÇÃO (actionLink):
1. Use SEMPRE o título humano completo ou a pergunta exata como valor do parâmetro.
2. NUNCA use IDs técnicos, underscores (ex: previsao_pib) ou slugs. Use espaços normais.
3. Formatos obrigatórios:
   - Para 'Alegação': /fact-check?claim=TITULO_DA_NOTICIA
   - Para 'Nova Lei': /legislation?question=TITULO_DA_NOTICIA
   - Para 'Análise': /explorer?request=TITULO_DA_NOTICIA ou /dashboard?request=TITULO_DA_NOTICIA

EXEMPLO DE LINK CORRETO: /explorer?request=Previsão de Crescimento do PIB em 2026
EXEMPLO DE LINK ERRADO: /explorer?request=previsao_pib_2026

As notícias devem focar-se no OE2026, habitação e indicadores económicos.
Use datas entre 2026-02-25 e 2026-03-10.`,
});

const generateNewsFeedFlow = ai.defineFlow(
  {
    name: 'generateNewsFeedFlow',
    outputSchema: GenerateNewsFeedOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
