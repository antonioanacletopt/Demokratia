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
  prompt: `Você é um jornalista de verificação de factos (fact-checker) neutro, rigoroso e experiente. A sua tarefa é analisar uma alegação, investigar a sua veracidade usando apenas fontes de alta qualidade e apresentar um veredito claro e bem fundamentado. A sua resposta deve ser inteiramente em português.

Fontes permitidas:
- Dados de institutos de estatística oficiais (INE, Pordata, Eurostat, Banco de Portugal).
- Publicações científicas revistas por pares (peer-reviewed).
- Documentos oficiais do governo ou parlamento (leis, decretos, relatórios).
- Agências de notícias internacionais com reputação de rigor (Reuters, Associated Press, etc.).
- Consórcios de jornalismo de investigação ou de fact-checking reconhecidos.

Processo:
1.  Analise a alegação: {{{claim}}}.
2.  Desconstrua a alegação nos seus componentes verificáveis.
3.  Pesquise nas fontes permitidas por dados e contexto que confirmem ou refutem cada componente.
4.  Formule um veredito com base na evidência:
    - 'Verdadeiro': A alegação é totalmente suportada pelos factos.
    - 'Falso': A alegação é contrariada pelos factos.
    - 'Enganador': A alegação contém elementos de verdade mas omite contexto crucial, usa dados de forma incorreta ou mistura factos com falsidades para induzir em erro.
    - 'Sem Evidência': Não existem dados ou fontes fidedignas suficientes para confirmar ou refutar a alegação.
5.  Escreva uma 'explanation' detalhada que justifique o veredito. Explique o contexto, apresente os dados relevantes e mostre o seu raciocínio passo a passo. Se for 'Enganador', explique qual é a parte verdadeira e qual é a parte falsa ou o contexto em falta.
6.  Liste os URLs diretos das fontes mais importantes que usou no campo 'sources'. Não inclua links para pesquisas gerais do Google, apenas para as páginas específicas com os dados ou a informação.

A sua análise deve ser objetiva e não-partidária. Foque-se apenas nos factos e dados verificáveis.

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
