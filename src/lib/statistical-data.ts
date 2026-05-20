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

// ─── Dados geográficos por distrito ─────────────────────────────────────────
// Fontes: INE (salários, população, habitação), PORDATA (pobreza), RASI 2024 (crime)
// Atualizar aqui quando o INE / DGPJ publicar novos dados.

export interface DistrictData {
  id: string;    // corresponde ao id do path no SVG do mapa
  name: string;
  salary: number;       // salário médio mensal (€)
  poverty: number;      // taxa de pobreza (%)
  population: number;   // população (milhares)
  housing: number;      // preço mediano habitação (€/m²)
  crime: number;        // crimes / 1000 hab — RASI 2024, NUTS II (MAI/DGPJ)
}

export const DISTRICT_DATA_2026: DistrictData[] = [
  { id: 'path-aveiro',           name: 'Aveiro',           salary: 1480, poverty: 16.2, population: 258,  housing: 1650, crime: 17.9 },
  { id: 'path-beja',             name: 'Beja',             salary: 1320, poverty: 22.5, population: 15,   housing: 1100, crime: 14.6 },
  { id: 'path-braga',            name: 'Braga',            salary: 1450, poverty: 17.1, population: 320,  housing: 1750, crime: 26.7 },
  { id: 'path-braganca',         name: 'Bragança',         salary: 1280, poverty: 24.8, population: 18,   housing:  950, crime: 26.7 },
  { id: 'path-castelo-branco',   name: 'Castelo Branco',   salary: 1310, poverty: 21.2, population: 26,   housing: 1050, crime: 17.9 },
  { id: 'path-coimbra',          name: 'Coimbra',          salary: 1420, poverty: 17.8, population: 102,  housing: 1550, crime: 17.9 },
  { id: 'path-evora',            name: 'Évora',            salary: 1380, poverty: 19.5, population: 21,   housing: 1350, crime: 14.6 },
  { id: 'path-faro',             name: 'Faro',             salary: 1480, poverty: 16.5, population: 92,   housing: 2900, crime: 32.9 },
  { id: 'path-guarda',           name: 'Guarda',           salary: 1260, poverty: 25.1, population: 24,   housing:  900, crime: 17.9 },
  { id: 'path-leiria',           name: 'Leiria',           salary: 1440, poverty: 16.8, population: 132,  housing: 1600, crime: 17.9 },
  { id: 'path-lisboa',           name: 'Lisboa',           salary: 1950, poverty: 14.2, population: 1050, housing: 4500, crime: 42.3 },
  { id: 'path-portalegre',       name: 'Portalegre',       salary: 1290, poverty: 23.8, population: 16,   housing: 1000, crime: 14.6 },
  { id: 'path-porto',            name: 'Porto',            salary: 1650, poverty: 15.8, population: 850,  housing: 3200, crime: 26.7 },
  { id: 'path-santarem',         name: 'Santarém',         salary: 1390, poverty: 18.2, population: 65,   housing: 1300, crime: 17.9 },
  { id: 'path-setubal',          name: 'Setúbal',          salary: 1580, poverty: 15.5, population: 185,  housing: 2400, crime: 42.3 },
  { id: 'path-viana-do-castelo', name: 'Viana do Castelo', salary: 1380, poverty: 19.2, population: 105,  housing: 1400, crime: 26.7 },
  { id: 'path-vila-real',        name: 'Vila Real',        salary: 1340, poverty: 21.5, population: 45,   housing: 1150, crime: 26.7 },
  { id: 'path-viseu',            name: 'Viseu',            salary: 1360, poverty: 20.1, population: 72,   housing: 1250, crime: 17.9 },
  { id: 'path-acores',           name: 'Açores',           salary: 1350, poverty: 24.5, population: 24,   housing: 1200, crime: 16.8 },
  { id: 'path-madeira',          name: 'Madeira',          salary: 1420, poverty: 22.1, population: 25,   housing: 2100, crime: 14.5 },
];

// ─── Baseline macroeconómico 2026 ────────────────────────────────────────────
// Fonte: OE 2026 (Ministério das Finanças), Banco de Portugal, INE
// Usado em: scenarios (sliders reset), simulations (contexto), inflation (referência)

export const REALITY_2026 = {
  irs:          25,
  iva:          23,
  irc:          21,
  investment:    2.5,
  smn:         870,
  gdp:           2.4,
  unemployment:  6.1,
  inflation:     2.0,
  debt:         88.5,
  balance:       0.2,
};

export const BUDGET_2026 = {
  health:    15.2,
  education:  9.8,
  social:    24.5,
  defense:    2.8,
  infra:      5.4,
  revenue:   72.5,
};

// ─── Despesas mensais domésticas por defeito ─────────────────────────────────
// Fonte: INE — Inquérito às Despesas das Famílias 2022/2023 (média nacional)
// Usado para pré-preencher a página de orçamento e calcular impacto da inflação.

export const DEFAULT_COSTS_2026 = {
  housing:        750,
  food:           350,
  utilities:      150,
  transport:      120,
  health:          60,
  leisure:        100,
  education:      150,
  communications:  65,
  savings:        100,
  insurance:      120,
  other:          100,
};

/** Soma das despesas por defeito — despesa média mensal de uma família portuguesa. */
export const AVG_MONTHLY_HOUSEHOLD = Object.values(DEFAULT_COSTS_2026).reduce((a, b) => a + b, 0);

// ─── Valores de exemplo para o formulário IRS ────────────────────────────────
// Valores típicos de um trabalhador por conta de outrem em Portugal (2026).
// O utilizador pode alterar livremente — servem apenas de ponto de partida.

export const IRS_DEFAULTS = {
  income: {
    categoryA:  25000,
    categoryB:      0,
    propertyIncome: 0,
    capitalIncome:  0,
  },
  expenses: {
    health:     500,
    education:  200,
    housing:   1200,
    general:   2000,
    donations:  100,
    unionFees:   60,
    vatOnInvoices: 150,
  },
  retention:  3000,
};

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