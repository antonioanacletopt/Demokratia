/**
 * @fileOverview Ponte de compatibilidade para Server Actions e Tipos.
 * Este ficheiro re-exporta as funções de @/lib/actions e os tipos de @/lib/actions-schema.
 * Não possui a diretiva 'use server' para permitir a coexistência de exportação de tipos e funções.
 */

import { 
  getTranslation, 
  getEconomicSimulation, 
  getFactCheck, 
  getLegislationInfo, 
  getScenarioAnalysis, 
  getIRSAssessment, 
  getFamilyBudgetAnalysis, 
  getMarketAnalysis, 
  getNewsFeed, 
  getChartFromRequest, 
  getPublicStatistic 
} from './actions';

export { 
  getTranslation, 
  getEconomicSimulation, 
  getFactCheck, 
  getLegislationInfo, 
  getScenarioAnalysis, 
  getIRSAssessment, 
  getFamilyBudgetAnalysis, 
  getMarketAnalysis, 
  getNewsFeed, 
  getChartFromRequest, 
  getPublicStatistic 
};

// Re-exportamos os tipos do ficheiro de esquemas neutro
export type { 
  FactCheckOutput, 
  EconomicSimulationOutput, 
  MarketAnalysisOutput, 
  NewsFeedOutput, 
  IRSAssessmentOutput,
  ConsultLegislationOutput,
  ChartOutput,
  FamilyBudgetOutput,
  ScenarioAnalysisOutput
} from './actions-schema';
