'use server';
/**
 * @fileOverview AI flow to calculate and simulate Portuguese IRS for 2026.
 * It considers marital status, dependents, and various tax deductions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CalculateIRSInputSchema = z.object({
  maritalStatus: z.enum(['Single', 'Married_Joint', 'Married_Separate']),
  dependents: z.number().min(0),
  grossAnnualIncome: z.number().describe('Rendimento global bruto anual do agregado (ou do sujeito passivo se separado).'),
  expenses: z.object({
    health: z.number().default(0),
    education: z.number().default(0),
    housing: z.number().default(0),
    general: z.number().default(0),
  }),
  retention: z.number().describe('Valor total já retido na fonte durante o ano.'),
  language: z.enum(['Portuguese', 'English']).default('Portuguese'),
});
export type CalculateIRSInput = z.infer<typeof CalculateIRSInputSchema>;

const CalculateIRSOutputSchema = z.object({
  estimatedTax: z.number().describe('Valor total de imposto apurado.'),
  refundOrPayment: z.number().describe('Valor final a receber (positivo) ou a pagar (negativo).'),
  effectiveRate: z.number().describe('Taxa efetiva de imposto em percentagem.'),
  analysis: z.string().describe('Explicação detalhada dos escalões aplicados e impacto das deduções.'),
  tips: z.array(z.string()).describe('Dicas para otimização fiscal no próximo ano.'),
});
export type CalculateIRSOutput = z.infer<typeof CalculateIRSOutputSchema>;

export async function calculateIRS(input: CalculateIRSInput): Promise<CalculateIRSOutput> {
  return calculateIRSFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateIRSPrompt',
  input: { schema: CalculateIRSInputSchema },
  output: { schema: CalculateIRSOutputSchema },
  prompt: `Você é um consultor fiscal de elite em Portugal, especializado no Orçamento de Estado de 2026.
Sua tarefa é calcular uma estimativa rigorosa do IRS e explicar o resultado ao cidadão.

**DADOS DO CONTRIBUINTE:**
- Estado Civil: {{maritalStatus}}
- Dependentes: {{dependents}}
- Rendimento Bruto Anual: {{grossAnnualIncome}}€
- Retenção na Fonte já efetuada: {{retention}}€

**DESPESAS PARA DEDUÇÃO:**
- Saúde: {{expenses.health}}€
- Educação: {{expenses.education}}€
- Habitação (Juros/Rendas): {{expenses.housing}}€
- Despesas Gerais Familiares: {{expenses.general}}€

**INSTRUÇÕES:**
1. Aplique os escalões de IRS previstos para 2026 (considerando a inflação e atualizações do OE2026).
2. Calcule o Coeficiente Familiar (quociente conjugal se casado).
3. Calcule as deduções à coleta baseadas nas despesas fornecidas (limites legais de 2026).
4. Determine se o resultado é REEMBOLSO (positivo) ou PAGAMENTO (negativo).
5. No campo 'analysis', explique em que escalão o utilizador ficou e como as deduções ajudaram a baixar o imposto.
6. O tom deve ser profissional, claro e em {{language}}.

**CÁLCULO FISCAL:**`,
});

const calculateIRSFlow = ai.defineFlow(
  {
    name: 'calculateIRSFlow',
    inputSchema: CalculateIRSInputSchema,
    outputSchema: CalculateIRSOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
