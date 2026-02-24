
/**
 * @fileOverview This file implements a Genkit flow for fact-checking claims
 * based on reliable public sources. Updated for 2026 and input normalization.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FactCheckInputSchema = z.object({
  claim: z.string().describe('A alegação a verificar.'),
  language: z.enum(['Portuguese', 'English']).default('Portuguese').describe('O idioma para o resultado.'),
});
export type FactCheckInput = z.infer<typeof FactCheckInputSchema>;

const FactCheckOutputSchema = z.object({
  verdict: z.enum(['Verdadeiro', 'Falso', 'Enganador', 'Sem Evidência']).describe('O veredicto final.'),
  explanation: z.string().describe('Explicação detalhada com contexto.'),
  sources: z.array(z.string()).describe('Lista de URLs das fontes primárias.'),
});
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;

export async function factCheckClaim(input: FactCheckInput): Promise<FactCheckOutput> {
  return factCheckClaimFlow(input);
}

const prompt = ai.definePrompt({
  name: 'factCheckClaimPrompt',
  input: { schema: FactCheckInputSchema },
  output: { schema: FactCheckOutputSchema },
  prompt: `Você é um jornalista de investigação especializado em fact-checking, focado na realidade portuguesa de Março de 2026.

**NORMALIZAÇÃO DE INPUT:**
- O utilizador pode submeter texto com erros ortográficos. Corrija-os mentalmente e baseie a sua verificação no sentido correto da frase. A sua explicação deve estar escrita de forma gramaticalmente impecável em {{{language}}}.

**Análise Rigorosa (Contexto 2026):**
1. Não aceite dados de 2023 como "atuais" se existirem atualizações em 2024 ou 2025.
2. Verifique se a alegação se refere ao Orçamento de Estado 2026 ou a medidas recentes do governo.
3. Se um dado era verdadeiro em 2023 mas foi desmentido ou alterado em 2025, o veredicto deve ser 'Falso' ou 'Enganador' com a devida explicação da evolução temporal.

Alegação a verificar: "{{{claim}}}"

Escreva a sua resposta (campos 'verdict' e 'explanation') obrigatoriamente em {{{language}}}.`,
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
