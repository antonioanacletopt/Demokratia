export type StatisticalData = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  categoryKey: string;
  sourceKey: string;
  headersKey: string;
  lastUpdated: string;
  dataType: 'table' | 'barchart' | 'piechart';
  data: any[];
};

export const statisticalDataToSeed: Omit<StatisticalData, 'title' | 'description' | 'category' | 'source'>[] = [
  {
    id: 'average-monthly-earnings-2026',
    titleKey: 'statisticalData.average-monthly-earnings-2026.title',
    descriptionKey: 'statisticalData.average-monthly-earnings-2026.description',
    categoryKey: 'statisticalData.average-monthly-earnings-2026.category',
    sourceKey: 'statisticalData.average-monthly-earnings-2026.source',
    headersKey: 'statisticalData.average-monthly-earnings-2026.headers',
    lastUpdated: '2026-02-15',
    dataType: 'table',
    data: [
      { year: 2024, avg_earning: 1465, variation: "+4.2%" },
      { year: 2025, avg_earning: 1530, variation: "+4.4%" },
      { year: 2026, avg_earning: 1610, variation: "+5.2%" }
    ]
  },
  {
    id: 'companies-by-size-2026',
    titleKey: 'statisticalData.companies-by-size-2026.title',
    descriptionKey: 'statisticalData.companies-by-size-2026.description',
    categoryKey: 'statisticalData.companies-by-size-2026.category',
    sourceKey: 'statisticalData.companies-by-size-2026.source',
    headersKey: 'statisticalData.companies-by-size-2026.headers',
    lastUpdated: '2026-03-01',
    dataType: 'table',
    data: [
      { size: "Micro (0-9)", companies: 1245000, total_percentage: "96.1%" },
      { size: "Pequenas (10-49)", companies: 42000, total_percentage: "3.2%" },
      { size: "Médias (50-249)", companies: 6800, total_percentage: "0.5%" },
      { size: "Grandes (250+)", companies: 1200, total_percentage: "0.2%" }
    ]
  },
  {
    id: 'government-debt-2026',
    titleKey: 'statisticalData.government-debt-2026.title',
    descriptionKey: 'statisticalData.government-debt-2026.description',
    categoryKey: 'statisticalData.government-debt-2026.category',
    sourceKey: 'statisticalData.government-debt-2026.source',
    headersKey: 'statisticalData.government-debt-2026.headers',
    lastUpdated: '2026-02-10',
    dataType: 'table',
    data: [
      { year: 2021, debt_gdp_percent: "124.5%" },
      { year: 2022, debt_gdp_percent: "112.4%" },
      { year: 2023, debt_gdp_percent: "99.1%" },
      { year: 2024, debt_gdp_percent: "95.4%" },
      { year: 2025, debt_gdp_percent: "91.2%" },
      { year: 2026, debt_gdp_percent: "88.5%" }
    ]
  },
  {
    id: 'residence-permits-2026',
    titleKey: 'statisticalData.residence-permits-2026.title',
    descriptionKey: 'statisticalData.residence-permits-2026.description',
    categoryKey: 'statisticalData.residence-permits-2026.category',
    sourceKey: 'statisticalData.residence-permits-2026.source',
    headersKey: 'statisticalData.residence-permits-2026.headers',
    lastUpdated: '2026-03-10',
    dataType: 'table',
    data: [
      { type: "Novos Títulos", quantity: 145000, status: "Processado" },
      { type: "Renovações", quantity: 280000, status: "Concluído" },
      { type: "CPLP (Regime Especial)", quantity: 95000, status: "Simplificado" }
    ]
  },
  {
    id: 'doctors-sns-2026',
    titleKey: 'statisticalData.doctors-sns-2026.title',
    descriptionKey: 'statisticalData.doctors-sns-2026.description',
    categoryKey: 'statisticalData.doctors-sns-2026.category',
    sourceKey: 'statisticalData.doctors-sns-2026.source',
    headersKey: 'statisticalData.doctors-sns-2026.headers',
    lastUpdated: '2026-01-20',
    dataType: 'table',
    data: [
      { specialty: "Medicina Geral e Familiar", doctors: 6450, status: "Reforçado" },
      { specialty: "Medicina Interna", doctors: 2800, status: "Estável" },
      { specialty: "Pediatria", doctors: 1450, status: "Em carência" },
      { specialty: "Cirurgia Geral", doctors: 1200, status: "Estável" }
    ]
  },
  {
    id: 'early-school-leaving-2026',
    titleKey: 'statisticalData.early-school-leaving-2026.title',
    descriptionKey: 'statisticalData.early-school-leaving-2026.description',
    categoryKey: 'statisticalData.early-school-leaving-2026.category',
    sourceKey: 'statisticalData.early-school-leaving-2026.source',
    headersKey: 'statisticalData.early-school-leaving-2026.headers',
    lastUpdated: '2026-02-28',
    dataType: 'table',
    data: [
      { year: 2023, rate: 8.0 },
      { year: 2024, rate: 7.4 },
      { year: 2025, rate: 6.8 },
      { year: 2026, rate: 6.2 }
    ]
  },
  {
    id: 'higher-education-enrollment-2026',
    titleKey: 'statisticalData.higher-education-enrollment-2026.title',
    descriptionKey: 'statisticalData.higher-education-enrollment-2026.description',
    categoryKey: 'statisticalData.higher-education-enrollment-2026.category',
    sourceKey: 'statisticalData.higher-education-enrollment-2026.source',
    headersKey: 'statisticalData.higher-education-enrollment-2026.headers',
    lastUpdated: '2026-01-30',
    dataType: 'table',
    data: [
      { subsystem: "Universitário Público", enrolled: 245000 },
      { subsystem: "Politécnico Público", enrolled: 128000 },
      { subsystem: "Privado", enrolled: 82000 }
    ]
  },
  {
    id: 'emigration-stats-2026',
    titleKey: 'statisticalData.emigration-stats-2026.title',
    descriptionKey: 'statisticalData.emigration-stats-2026.description',
    categoryKey: 'statisticalData.emigration-stats-2026.category',
    sourceKey: 'statisticalData.emigration-stats-2026.source',
    headersKey: 'statisticalData.emigration-stats-2026.headers',
    lastUpdated: '2026-03-05',
    dataType: 'table',
    data: [
      { flow: "Emigração Permanente", people: 62000, trend: "Queda" },
      { flow: "Regresso de Nacionais", people: 38000, trend: "Subida" },
      { flow: "Saldo Líquido", people: -24000, trend: "Melhoria" }
    ]
  }
];
