'use server';
/**
 * @fileOverview A news feed generation AI agent. Updated for 2026.
 * Ensures every item has an action link with proper query parameters.
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
A sua tarefa é gerar uma lista de 4 a 5 notícias recentes e relevantes sobre o panorama político e económico português, 
considerando que estamos em Março de 2026.

REGRAS OBRIGATÓRIAS PARA OS LINKS DE AÇÃO (actionLink):
1. Para cada 'Alegação', forneça SEMPRE um link para 'Verificar Facto' usando o parâmetro 'claim': (/fact-check?claim=TEXTO_DO_TITULO).
2. Para cada 'Nova Lei', forneça um link para 'Consultar Detalhes' usando o parâmetro 'question': (/legislation?question=TEXTO_DO_TITULO).
3. Para cada 'Análise', forneça um link para 'Explorar Dados' usando o parâmetro 'request': (/explorer?request=TEXTO_DO_TITULO) ou 'Ver Gráfico' (/dashboard?request=TEXTO_DO_TITULO).

As notícias devem focar-se em:
- Execução do Orçamento do Estado 2026.
- Debate sobre as próximas eleições.
- Indicadores económicos recentes (PIB, Inflação).
- Novas leis de habitação.

IMPORTANTE: O texto do parâmetro deve ser o título da notícia ou a pergunta exata que descreve o conteúdo.

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
