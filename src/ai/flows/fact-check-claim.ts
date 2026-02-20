
/**
 * @fileOverview This file implements a Genkit flow for fact-checking claims
 * based on reliable public sources. Updated for maximum rigor and timeline analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FactCheckInputSchema = z.object({
  claim: z.string().describe('The claim or statement to be fact-checked.'),
  language: z.enum(['Portuguese', 'English']).default('Portuguese').describe('The language for the output.'),
});
export type FactCheckInput = z.infer<typeof FactCheckInputSchema>;

const FactCheckOutputSchema = z.object({
  verdict: z.enum(['Verdadeiro', 'Falso', 'Enganador', 'Sem Evidência']).describe('The final verdict of the fact-check.'),
  explanation: z.string().describe('A detailed explanation supporting the verdict.'),
  sources: z.array(z.string()).describe('A list of URLs to the primary sources used.'),
});
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;

export async function factCheckClaim(input: FactCheckInput): Promise<FactCheckOutput> {
  return factCheckClaimFlow(input);
}

const prompt = ai.definePrompt({
  name: 'factCheckClaimPrompt',
  input: { schema: FactCheckInputSchema },
  output: { schema: FactCheckOutputSchema },
  prompt: `Você é um jornalista de verificação de factos (fact-checker) de investigação, extremamente rigoroso e focado na realidade portuguesa.

**REGRA DE OURO: A sua resposta completa (campos 'verdict' e 'explanation') deve ser escrita OBRIGATORIAMENTE em {{{language}}}.**

Alegação a verificar: "{{{claim}}}"

Processo de Investigação:
1. Use fontes oficiais (INE, Pordata, Diário da República, Banco de Portugal) e imprensa de referência (Público, Expresso, Lusa, SIC, RTP).
2. **ANÁLISE TEMPORAL (CRÍTICO):** Não se limite aos dados iniciais ou às previsões otimistas. Verifique se, após o anúncio da previsão ou dado, ocorreram "tempestades" económicas, revisões em baixa ou se os próprios políticos/entidades admitiram posteriormente que os dados estavam incorretos ou eram enganadores.
3. Se um ministro previu algo que os dados confirmaram inicialmente, mas que mais tarde se revelou insustentável ou foi desmentido por admissão direta (ex: "afinal as contas estavam erradas" ou "o crescimento foi travado por fatores X"), o veredicto deve refletir essa complexidade (ex: 'Enganador' ou 'Falso' com a devida explicação da mudança de contexto).
4. Forneça um veredicto claro e uma explicação detalhada, pedagógica e contextualizada em {{{language}}}.

Todos os textos do JSON resultante devem estar em {{{language}}}.`,
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
