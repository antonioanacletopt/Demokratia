
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

REGRAS ABSOLUTAS PARA OS LINKS (actionLink.href):
1. O valor do parâmetro no URL deve ser EXATAMENTE igual ao 'title' da notícia.
2. NUNCA use IDs técnicos, underscores (_), slugs, siglas técnicas ou códigos (ex: previsao_superavit ou 1T2026). 
3. Use APENAS espaços normais e texto legível por humanos.
4. FORMATOS OBRIGATÓRIOS:
   - Se type for 'Alegação': /fact-check?claim=[COPIAR_TITLE_EXATO_AQUI]
   - Se type for 'Nova Lei': /legislation?question=[COPIAR_TITLE_EXATO_AQUI]
   - Se type for 'Análise': /explorer?request=[COPIAR_TITLE_EXATO_AQUI]

EXEMPLO CORRETO (Sem códigos, apenas texto):
{
  "title": "Aumento do Salário Mínimo em 2026",
  "actionLink": { "href": "/fact-check?claim=Aumento do Salário Mínimo em 2026", "label": "Verificar Factos" }
}

As notícias devem focar-se no OE2026, habitação e indicadores económicos reais de 2026.
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
