/**
 * @fileOverview Definições de Esquemas e Tipos da Demokratia.
 * Este ficheiro não possui a diretiva 'use server' para permitir a exportação
 * de constantes e tipos para componentes do servidor e do cliente.
 */

import { z } from 'genkit';

export const FactCheckOutputSchema = z.object({
  verdict: z.enum(['Verdadeiro', 'Falso', 'Enganador', 'Sem Evidência']),
  explanation: z.string(),
  sources: z.array(z.string().url()),
});
export type FactCheckOutput = z.infer<typeof FactCheckOutputSchema>;

export const EconomicSimulationOutputSchema = z.object({
  simulatedImpact: z.string(),
  reasoning: z.string(),
  isRealPolicy: z.boolean(),
  source: z.string().url().optional(),
  keyIndicators: z.array(z.object({
    name: z.string(),
    currentValue: z.number(),
    projectedValue: z.number(),
    unit: z.string(),
  })),
});
export type EconomicSimulationOutput = z.infer<typeof EconomicSimulationOutputSchema>;

export const LegislationOutputSchema = z.object({
  answer: z.string(),
  sources: z.array(z.string().url()),
});
export type ConsultLegislationOutput = z.infer<typeof LegislationOutputSchema>;

export const ScenarioAnalysisOutputSchema = z.object({
  feedback: z.string(),
  viabilityScore: z.number(),
});
export type ScenarioAnalysisOutput = z.infer<typeof ScenarioAnalysisOutputSchema>;

export const IRSAssessmentOutputSchema = z.object({
  refundOrPayment: z.number(),
  estimatedTax: z.number(),
  effectiveRate: z.number(),
  analysis: z.string(),
  tips: z.array(z.string()),
});
export type IRSAssessmentOutput = z.infer<typeof IRSAssessmentOutputSchema>;

export const FamilyBudgetOutputSchema = z.object({
  analysis: z.string(),
  suggestions: z.array(z.string()),
});
export type FamilyBudgetOutput = z.infer<typeof FamilyBudgetOutputSchema>;

export const MarketAnalysisOutputSchema = z.object({
  globalContext: z.string(),
  sentiment: z.enum(['Bullish', 'Bearish', 'Neutral']),
  sectors: z.array(z.object({
    name: z.string(),
    context: z.string(),
    opportunity: z.string(),
  })),
  assets: z.array(z.object({
    name: z.string(),
    currentValue: z.number(),
    trend: z.string(),
  })),
});
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;

export const NewsFeedOutputSchema = z.object({
  feedItems: z.array(z.object({
    id: z.string(),
    type: z.enum(['Alegação', 'Nova Lei', 'Análise']),
    title: z.string(),
    description: z.string(),
    source: z.string(),
    date: z.string(),
    actionLink: z.object({
      label: z.string(),
      href: z.string(),
    }).optional(),
  })),
});
export type NewsFeedOutput = z.infer<typeof NewsFeedOutputSchema>;

export const ChartOutputSchema = z.object({
  isChartable: z.boolean(),
  chartTitle: z.string().optional(),
  chartType: z.enum(['bar', 'line']).optional(),
  yAxisLabel: z.string().optional(),
  explanation: z.string(),
  chartData: z.array(z.object({
    label: z.string(),
    value: z.number(),
  })).optional(),
});
export type ChartOutput = z.infer<typeof ChartOutputSchema>;
