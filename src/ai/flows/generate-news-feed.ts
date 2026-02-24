'use server';
/**
 * @fileOverview A news feed generation AI agent. Updated for 2026.
 * REGRAS CRÍTICAS: Nunca usar identificadores técnicos, IDs ou underscores nos links.
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
  prompt: `Você é um analista político e económico experiente, focado na atualidade portuguesa no ano de 2026. Estamos em Março de 2026.

REGRAS ABSOLUTAS PARA OS LINKS (actionLink.href):
1. O parâmetro do link deve ser EXATAMENTE o texto humano do título da notícia.
2. É ESTRITAMENTE PROIBIDO usar identificadores técnicos, IDs simplificados, underscores (_) ou códigos.
3. FORMATOS OBRIGATÓRIOS:
   - Alegação: /fact-check?claim=[TÍTULO DA NOTÍCIA EXATO]
   - Nova Lei: /legislation?question=[TÍTULO DA NOTÍCIA EXATO]
   - Análise (Estatística): /explorer?request=[TÍTULO DA NOTÍCIA EXATO]
   - Simulação (Impacto/Política): /simulations?policy=[TÍTULO DA NOTÍCIA EXATO]

4. CRITÉRIO DE CATEGORIA (MUITO IMPORTANTE):
   - Se a notícia fala de "Impacto", "Consequências", "Previsão de efeitos" ou "Novas taxas/impostos", use obrigatoriamente a ação de Simulação (/simulations) e o rótulo "Simular Impacto".
   - Se a notícia fala de "Dados consolidados", "Estatísticas do INE/Pordata", "Números de 2025", use Análise (/explorer) e o rótulo "Explorar Dados".

As notícias devem focar-se no Orçamento de Estado 2026, habitação, novos impostos imobiliários e crescimento económico real de 2026.`,
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
