'use server';
/**
 * @fileOverview A news feed generation AI agent. Updated for 2026.
 * Ensures every item has an action link with proper human-readable titles.
 * PROIBIDO: O uso de IDs técnicos, underscores (_) ou códigos nos links.
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
  }).describe('Uma ação obrigatória.')
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
A sua tarefa é gerar uma lista de 4 a 5 notícias recentes considerando que estamos em Março de 2026.

REGRAS CRÍTICAS PARA OS LINKS (actionLink.href):
1. Use APENAS o texto do título da notícia como parâmetro.
2. NUNCA, SOB QUALQUER CIRCUNSTÂNCIA, use IDs técnicos como "previsao_superavit", "1T2026", underscores (_) ou códigos.
3. Se o título for "Aumento do Salário Mínimo", o link deve ser "/fact-check?claim=Aumento do Salário Mínimo".
4. FORMATOS:
   - Alegação: /fact-check?claim=[TÍTULO EXATO]
   - Nova Lei: /legislation?question=[TÍTULO EXATO]
   - Análise: /explorer?request=[TÍTULO EXATO]

Exemplo Humano:
{
  "title": "Crescimento do PIB em 2026",
  "actionLink": { "href": "/explorer?request=Crescimento do PIB em 2026", "label": "Explorar Dados" }
}

As notícias devem focar-se no OE2026, habitação e indicadores económicos reais de 2026.`,
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
