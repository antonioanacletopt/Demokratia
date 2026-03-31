type TranslationFunction = (key: string) => string | Record<string, string>;

export type StatisticalData = {
    id: string;
    title: string;
    description: string;
    category: string;
    source: string;
    headers: Record<string, string>;
    lastUpdated: string;
    dataType: 'table' | 'barchart' | 'piechart';
    data: any[];
};

const getStatisticalData = (t: TranslationFunction): Omit<StatisticalData, 'id'>[] => [
    {
        title: t('statisticalData.average-monthly-earnings-2026.title') as string,
        description: t('statisticalData.average-monthly-earnings-2026.description') as string,
        category: t('statisticalData.average-monthly-earnings-2026.category') as string,
        source: t('statisticalData.average-monthly-earnings-2026.source') as string,
        headers: t('statisticalData.average-monthly-earnings-2026.headers') as Record<string, string>,
        lastUpdated: '2026-02-15',
        dataType: 'table',
        data: [
            { year: 2024, avg_earning: 1465, variation: "+4.2%" },
            { year: 2025, avg_earning: 1530, variation: "+4.4%" },
            { year: 2026, avg_earning: 1610, variation: "+5.2%" }
        ]
    },
    {
        title: t('statisticalData.companies-by-size-2026.title') as string,
        description: t('statisticalData.companies-by-size-2026.description') as string,
        category: t('statisticalData.companies-by-size-2026.category') as string,
        source: t('statisticalData.companies-by-size-2026.source') as string,
        headers: t('statisticalData.companies-by-size-2026.headers') as Record<string, string>,
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
        title: t('statisticalData.government-debt-2026.title') as string,
        description: t('statisticalData.government-debt-2026.description') as string,
        category: t('statisticalData.government-debt-2026.category') as string,
        source: t('statisticalData.government-debt-2026.source') as string,
        headers: t('statisticalData.government-debt-2026.headers') as Record<string, string>,
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
        title: t('statisticalData.residence-permits-2026.title') as string,
        description: t('statisticalData.residence-permits-2026.description') as string,
        category: t('statisticalData.residence-permits-2026.category') as string,
        source: t('statisticalData.residence-permits-2026.source') as string,
        headers: t('statisticalData.residence-permits-2026.headers') as Record<string, string>,
        lastUpdated: '2026-03-10',
        dataType: 'table',
        data: [
            { type: "Novos Títulos", quantity: 145000, status: "Processado" },
            { type: "Renovações", quantity: 280000, status: "Concluído" },
            { type: "CPLP (Regime Especial)", quantity: 95000, status: "Simplificado" }
        ]
    },
    {
        title: t('statisticalData.doctors-sns-2026.title') as string,
        description: t('statisticalData.doctors-sns-2026.description') as string,
        category: t('statisticalData.doctors-sns-2026.category') as string,
        source: t('statisticalData.doctors-sns-2026.source') as string,
        headers: t('statisticalData.doctors-sns-2026.headers') as Record<string, string>,
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
        title: t('statisticalData.early-school-leaving-2026.title') as string,
        description: t('statisticalData.early-school-leaving-2026.description') as string,
        category: t('statisticalData.early-school-leaving-2026.category') as string,
        source: t('statisticalData.early-school-leaving-2026.source') as string,
        headers: t('statisticalData.early-school-leaving-2026.headers') as Record<string, string>,
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
        title: t('statisticalData.higher-education-enrollment-2026.title') as string,
        description: t('statisticalData.higher-education-enrollment-2026.description') as string,
        category: t('statisticalData.higher-education-enrollment-2026.category') as string,
        source: t('statisticalData.higher-education-enrollment-2026.source') as string,
        headers: t('statisticalData.higher-education-enrollment-2026.headers') as Record<string, string>,
        lastUpdated: '2026-01-30',
        dataType: 'table',
        data: [
            { subsystem: "Universitário Público", enrolled: 245000 },
            { subsystem: "Politécnico Público", enrolled: 128000 },
            { subsystem: "Privado", enrolled: 82000 }
        ]
    },
    {
        title: t('statisticalData.emigration-stats-2026.title') as string,
        description: t('statisticalData.emigration-stats-2026.description') as string,
        category: t('statisticalData.emigration-stats-2026.category') as string,
        source: t('statisticalData.emigration-stats-2026.source') as string,
        headers: t('statisticalData.emigration-stats-2026.headers') as Record<string, string>,
        lastUpdated: '2026-03-05',
        dataType: 'table',
        data: [
            { flow: "Emigração Permanente", people: 62000, trend: "Queda" },
            { flow: "Regresso de Nacionais", people: 38000, trend: "Subida" },
            { flow: "Saldo Líquido", people: -24000, trend: "Melhoria" }
        ]
    }
];

export const statisticalDataToSeed = (t: TranslationFunction): StatisticalData[] => {
    const data = getStatisticalData(t);
    return data.map((d, i) => ({
        ...d,
        id: statisticalDataToSeedMap[i].id,
    }));
}

const statisticalDataToSeedMap = [
  {
    id: 'average-monthly-earnings-2026',
  },
  {
    id: 'companies-by-size-2026',
  },
  {
    id: 'government-debt-2026',
  },
  {
    id: 'residence-permits-2026',
  },
  {
    id: 'doctors-sns-2026',
  },
  {
    id: 'early-school-leaving-2026',
  },
  {
    id: 'higher-education-enrollment-2026',
  },
  {
    id: 'emigration-stats-2026',
  }
];