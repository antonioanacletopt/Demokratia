'use server';
/**
 * @fileOverview A news feed generation AI agent.
 *
 * - generateNewsFeed - A function that handles the news feed generation process.
 * - GenerateNewsFeedOutput - The return type for the generateNewsFeed function.
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
    href: z.string().describe('O URL para a ação relacionada (ex: /fact-check?claim=...).'),
    label: z.string().describe('O texto para o botão de ação (ex: "Verificar Facto").')
  }).optional().describe('Um link opcional para uma ação relevante na aplicação.')
});

export type FeedItem = z.infer<typeof FeedItemSchema>;

const GenerateNewsFeedOutputSchema = z.object({
  feedItems: z.array(FeedItemSchema).min(4).max(5).describe('Uma lista de 4 a 5 notícias recentes e relevantes sobre o panorama político e económico português.')
});
export type GenerateNewsFeedOutput = z.infer<typeof GenerateNewsFeedOutputSchema>;


export async function generateNewsFeed(): Promise<GenerateNewsFeedOutput> {
  return generateNewsFeedFlow();
}

const prompt = ai.definePrompt({
  name: 'generateNewsFeedPrompt',
  output: { schema: GenerateNewsFeedOutputSchema },
  prompt: `Você é um analista político e económico experiente, focado na atualidade portuguesa. A sua tarefa é gerar uma lista de 4 a 5 notícias recentes e relevantes que seriam de interesse para o público geral, abrangendo alegações políticas, novas propostas de lei e análises económicas.

Processo:
1.  Pesquise por notícias, debates e publicações oficiais dos últimos dias em Portugal.
2.  Selecione os 4 ou 5 tópicos mais importantes.
3.  Para cada tópico, crie um item de feed que siga o esquema definido.
4.  Crie descrições concisas e informativas.
5.  Quando apropriado, adicione um 'actionLink' que direcione o utilizador para uma página relevante dentro da aplicação Demokratia. Por exemplo:
    - Para uma alegação, o link deve apontar para '/fact-check' com a alegação como parâmetro de URL (ex: /fact-check?claim=...).
    - Para uma proposta de lei, o link deve apontar para '/simulator' com a descrição da política como parâmetro (ex: /simulator?policy=...).
    - Para uma análise de dados, o link pode apontar para '/dashboard' ou '/explorer'.
6.  A data deve ser recente (últimos 7 dias) e no formato AAAA-MM-DD.
7.  Garanta que a saída é um JSON válido que corresponde ao esquema.
`,
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
