
export type StatisticalData = {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  lastUpdated: string;
  dataType: 'table' | 'barchart' | 'piechart';
  data: any[];
};

export const statisticalDataToSeed: StatisticalData[] = [
  {
    id: 'state-budget-2026-spending',
    title: 'Orçamento do Estado 2026: Despesa por Missão',
    description: 'Distribuição da despesa total consolidada do Orçamento do Estado 2026. Reflete as prioridades em Habitação e Defesa decididas para este ano.',
    category: 'Estado',
    source: 'DGO - Direção-Geral do Orçamento / OE 2026',
    lastUpdated: '2026-01-15',
    dataType: 'table',
    data: [
      { "Missão": "Segurança Social e Solidariedade", "Valor (Mil Milhões €)": 25.8, "% do Total": "31.2%" },
      { "Missão": "Saúde (SNS)", "Valor (Mil Milhões €)": 17.2, "% do Total": "20.8%" },
      { "Missão": "Educação e Ensino Superior", "Valor (Mil Milhões €)": 11.5, "% do Total": "13.9%" },
      { "Missão": "Habitação e Infraestruturas", "Valor (Mil Milhões €)": 8.1, "% do Total": "9.8%" },
      { "Missão": "Operações da Dívida Pública", "Valor (Mil Milhões €)": 6.9, "% do Total": "8.3%" },
      { "Missão": "Defesa e Segurança", "Valor (Mil Milhões €)": 5.4, "% do Total": "6.5%" }
    ]
  },
  {
    id: 'government-debt-2026',
    title: 'Dívida Pública em % do PIB (2021-2026)',
    description: 'Trajetória da dívida pública portuguesa. Em 2026, Portugal mantém a tendência de redução abaixo da média da Zona Euro.',
    category: 'Economia',
    source: 'Banco de Portugal / IGCP 2026',
    lastUpdated: '2026-02-10',
    dataType: 'table',
    data: [
      { "Ano": 2021, "Dívida (% PIB)": "124,5%" },
      { "Ano": 2022, "Dívida (% PIB)": "112,4%" },
      { "Ano": 2023, "Dívida (% PIB)": "99,1%" },
      { "Ano": 2024, "Dívida (% PIB)": "95,4%" },
      { "Ano": 2025, "Dívida (% PIB)": "91,2%" },
      { "Ano": 2026, "Dívida (% PIB)": "88,5%" }
    ]
  }
];
