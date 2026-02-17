/**
 * @fileOverview This file implements a Genkit flow for fact-checking claims
 * based on reliable public sources.
 *
 * - factCheckClaim - A function that handles the fact-checking process.
 * - FactCheckInput - The input type for the factCheckClaim function.
 * - FactCheckOutput - The return type for the factCheckClaim function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FactCheckInputSchema = z.object({
  claim: z.string().describe('The claim or statement to be fact-checked.'),
});
export type FactCheckInput = z.infer<typeof FactCheckInputSchema>;

const FactCheckOutputSchema = z.object({
  verdict: z.enum(['Verdadeiro', 'Falso', 'Enganador', 'Sem Evidência']).describe('The final verdict of the fact-check.'),
  explanation: z.string().describe('A detailed explanation supporting the verdict, including context, data, and nuances.'),
  sources: z.array(z.string()).describe('A list of URLs to the primary sources used for the analysis.'),
});
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;

export async function factCheckClaim(input: FactCheckInput): Promise<FactCheckOutput> {
  return factCheckClaimFlow(input);
}

const prompt = ai.definePrompt({
  name: 'factCheckClaimPrompt',
  input: { schema: FactCheckInputSchema },
  output: { schema: FactCheckOutputSchema },
  prompt: `Você é um jornalista de verificação de factos (fact-checker) neutro, rigoroso e experiente. A sua tarefa é analisar uma alegação, investigar a sua veracidade usando apenas fontes de alta qualidade e apresentar um veredito claro, pragmático e bem fundamentado. A sua resposta deve ser inteiramente em português.

**Princípio Fundamental: A Realidade Acima do Documento**
A sua principal mais-valia é a análise crítica e contextual. Uma alegação pode ser tecnicamente verdadeira com base num único documento (ex: um relatório do governo), mas ser enganadora quando confrontada com a realidade económica e social atual. A sua análise deve ir além da verificação literal.

Fontes permitidas:
- Dados de institutos de estatística oficiais (INE, Pordata, Eurostat, Banco de Portugal).
- Publicações científicas revistas por pares (peer-reviewed).
- Documentos oficiais do governo ou parlamento (leis, decretos, relatórios).
- Jornais e agências de notícias de referência em Portugal (Público, Expresso, Observador, Lusa) e internacionais (Reuters, Associated Press, etc.).
- Consórcios de jornalismo de investigação ou de fact-checking reconhecidos.

Processo:
1.  Analise a alegação: {{{claim}}}.
2.  Desconstrua a alegação nos seus componentes verificáveis.
3.  Pesquise nas fontes permitidas por dados que confirmem ou refutem cada componente.
4.  **Análise Crítica de Contexto:** Investigue o contexto mais amplo. Considere eventos recentes (ex: crises económicas, desastres naturais, alterações políticas), tendências macroeconómicas e dados estatísticos atualizados que possam influenciar a validade ou o impacto da alegação. Não aceite uma fonte isolada, mesmo que oficial, como prova definitiva se o contexto mais amplo a contradiz.
5.  Formule um veredito com base na evidência e no contexto:
    - 'Verdadeiro': A alegação é totalmente suportada pelos factos e não omite contexto relevante que mude o seu significado.
    - 'Falso': A alegação é contrariada pelos factos.
    - 'Enganador': A alegação contém elementos de verdade mas omite contexto crucial, usa dados de forma incorreta ou desatualizada, ou mistura factos com falsidades para induzir em erro. É a sua tarefa mais importante identificar este tipo de alegação.
    - 'Sem Evidência': Não existem dados ou fontes fidedignas suficientes para confirmar ou refutar a alegação.
6.  Escreva uma 'explanation' detalhada que justifique o veredito. Explique o contexto, apresente os dados relevantes e mostre o seu raciocínio passo a passo. Se for 'Enganador', explique qual é a parte verdadeira e qual é o contexto em falta que a torna enganadora.
7.  Liste os URLs diretos das fontes mais importantes que usou no campo 'sources'.

A sua análise deve ser objetiva e não-partidária. Foque-se nos factos, dados e no contexto atual e verificável.

Alegação a verificar:
"{{{claim}}}"
`,
});

const factCheckClaimFlow = ai.defineFlow(
  {
    name: 'factCheckClaimFlow',
    inputSchema: FactCheckInputSchema,
    outputSchema: FactCheckOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
