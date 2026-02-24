'use server';
/**
 * @fileOverview A news feed generation AI agent. Updated for 2026.
 * REGRAS CRÍTICAS: Foco total na relevância social, política e económica para o cidadão.
 * Prioriza o impacto real na vida das pessoas (bolso, direitos, serviços públicos).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FeedItemSchema = z.object({
  id: z.string().describe('Um identificador único para o item de feed.'),
  type: z.enum(['Alegação', 'Nova Lei', 'Análise']).describe('O tipo de notícia.'),
  title: z.string().describe('O título da notícia.'),
  source: z.string().describe('A fonte da notícia (ex: "Governo", "DRE", "INE").'),
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

CRITÉRIO DE SELEÇÃO (MUITO IMPORTANTE):
A sua tarefa não é apenas listar notícias, mas selecionar os factos que têm maior RELEVÂNCIA SOCIAL. 
Escolha temas que impactem diretamente a vida, o bolso ou os direitos do cidadão comum, como:
- Alterações fiscais (IRS, impostos sobre habitação).
- Decisões sobre o SNS ou Educação.
- Evolução real do poder de compra e inflação.
- Simplificação da burocracia (heranças, legalizações).
- Grandes decisões parlamentares com impacto social.

REGRAS ABSOLUTAS PARA OS LINKS (actionLink.href):
1. O parâmetro do link deve ser EXATAMENTE o texto humano do título da notícia.
2. FORMATOS OBRIGATÓRIOS:
   - Alegação: /fact-check?claim=[TÍTULO DA NOTÍCIA EXATO]
   - Nova Lei: /legislation?question=[TÍTULO DA NOTÍCIA EXATO]
   - Análise (Estatística): /explorer?request=[TÍTULO DA NOTÍCIA EXATO]
   - Simulação (Impacto/Política): /simulations?policy=[TÍTULO DA NOTÍCIA EXATO]

As notícias devem ser diversas e refletir o que importa à sociedade para estar informada de forma isenta e rigorosa em 2026.`,
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
