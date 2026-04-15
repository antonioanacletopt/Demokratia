// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CpiCategory {
  coicop: string;
  labelPt: string;
  labelEn: string;
  icon: string;
  rate: number;       // % YoY change
  weight: number;     // % weight in INE basket
  budgetKey?: string; // maps to budget page category
  color: string;
}

export interface InflationData {
  overall: number;
  period: string;       // e.g. '2026-02'
  periodLabel: string;  // e.g. 'Fevereiro 2026'
  source: string;
  categories: CpiCategory[];
  isLive: boolean;
  updatedAt: string;
}

export interface OtherIndicator {
  id: string;
  labelPt: string;
  labelEn: string;
  official: number;
  officialLabel: string;
  real: number;
  realLabel: string;
  explanation: string;
  unit: string;
  icon: string;
  color: string;
  source: string;
}

// ─────────────────────────────────────────────
// Baseline data — INE / Eurostat IHPC, Fevereiro 2026
// Overridden at runtime by live Eurostat fetch (cached 12h).
// ─────────────────────────────────────────────

export const BASELINE_DATA: InflationData = {
  overall: 2.7,
  period: '2026-02',
  periodLabel: 'Fevereiro 2026',
  source: 'INE / Eurostat IHPC',
  isLive: false,
  updatedAt: '2026-04-01',
  categories: [
    { coicop: 'CP01', labelPt: 'Alimentação',           labelEn: 'Food & Beverages',     icon: '🛒', rate: 3.2,  weight: 16.8, budgetKey: 'food',           color: '#22c55e' },
    { coicop: 'CP02', labelPt: 'Álcool & Tabaco',        labelEn: 'Alcohol & Tobacco',    icon: '🍷', rate: 5.1,  weight: 4.2,                               color: '#a78bfa' },
    { coicop: 'CP03', labelPt: 'Vestuário & Calçado',    labelEn: 'Clothing & Footwear',  icon: '👕', rate: 1.8,  weight: 5.1,                               color: '#60a5fa' },
    { coicop: 'CP04', labelPt: 'Habitação & Energia',    labelEn: 'Housing & Energy',     icon: '🏠', rate: 4.2,  weight: 15.3, budgetKey: 'housing',        color: '#f97316' },
    { coicop: 'CP05', labelPt: 'Mobiliário',              labelEn: 'Furnishings',          icon: '🪑', rate: 1.5,  weight: 6.4,                               color: '#84cc16' },
    { coicop: 'CP06', labelPt: 'Saúde',                   labelEn: 'Health',               icon: '❤️', rate: 2.9,  weight: 7.3,  budgetKey: 'health',         color: '#ef4444' },
    { coicop: 'CP07', labelPt: 'Transportes',             labelEn: 'Transport',            icon: '🚗', rate: 1.2,  weight: 14.2, budgetKey: 'transport',      color: '#14b8a6' },
    { coicop: 'CP08', labelPt: 'Comunicações',            labelEn: 'Communications',       icon: '📱', rate: -1.8, weight: 3.2,  budgetKey: 'communications', color: '#6366f1' },
    { coicop: 'CP09', labelPt: 'Lazer & Cultura',         labelEn: 'Recreation & Culture', icon: '🎭', rate: 2.3,  weight: 7.8,  budgetKey: 'leisure',        color: '#ec4899' },
    { coicop: 'CP10', labelPt: 'Educação',                labelEn: 'Education',            icon: '📚', rate: 4.5,  weight: 1.5,  budgetKey: 'education',      color: '#f59e0b' },
    { coicop: 'CP11', labelPt: 'Restaurantes & Hotéis',  labelEn: 'Restaurants & Hotels', icon: '🍽️', rate: 5.2,  weight: 10.4,                              color: '#06b6d4' },
    { coicop: 'CP12', labelPt: 'Bens Diversos',           labelEn: 'Miscellaneous',        icon: '📦', rate: 3.1,  weight: 7.8,  budgetKey: 'other',          color: '#8b5cf6' },
  ],
};

// ─────────────────────────────────────────────
// Other indicators — "o que os números escondem"
// ─────────────────────────────────────────────

export const OTHER_INDICATORS: OtherIndicator[] = [
  {
    id: 'gdp',
    labelPt: 'PIB (Crescimento)',
    labelEn: 'GDP (Growth)',
    official: 2.4,
    officialLabel: 'Crescimento nominal anunciado',
    real: 0.4,
    realLabel: 'Variação real do poder de compra do trabalhador mediano',
    unit: '%',
    icon: '📊',
    color: '#3b82f6',
    explanation: 'O PIB cresceu 2.4%, mas esse crescimento não se distribui uniformemente. Descontando a inflação e tendo em conta que os lucros empresariais crescem mais do que os salários medianos, o trabalhador típico vê o seu poder de compra real aumentar muito menos — ou até diminuir.',
    source: 'INE / Banco de Portugal 2026',
  },
  {
    id: 'unemployment',
    labelPt: 'Desemprego',
    labelEn: 'Unemployment',
    official: 6.1,
    officialLabel: 'Taxa oficial INE',
    real: 11.2,
    realLabel: 'Desemprego alargado (+ desencorajados + subempregados)',
    unit: '%',
    icon: '👥',
    color: '#f59e0b',
    explanation: 'A taxa oficial conta apenas quem procurou activamente emprego nas últimas 4 semanas. Os "desencorajados" (desistiram de procurar) e os subempregados (trabalham a tempo parcial involuntariamente) ficam de fora. O desemprego alargado é quase o dobro do número oficial.',
    source: 'INE / Eurostat LFS 2026',
  },
  {
    id: 'wages',
    labelPt: 'Salários Reais',
    labelEn: 'Real Wages',
    official: 5.2,
    officialLabel: 'Aumento nominal médio',
    real: 2.5,
    realLabel: 'Aumento real depois de descontar a inflação',
    unit: '%',
    icon: '💰',
    color: '#22c55e',
    explanation: 'Os salários nominais subiram 5.2% em média — mas "em média" esconde muito: os cargos de topo cresceram mais. Descontando a inflação de 2.7%, o aumento real é ~2.5%. Para quem está próximo do salário mínimo ou em sectores com menor crescimento salarial, o ganho real pode ser nulo ou negativo.',
    source: 'INE / Ministério do Trabalho 2026',
  },
  {
    id: 'housing',
    labelPt: 'Custo da Habitação',
    labelEn: 'Housing Costs',
    official: 4.2,
    officialLabel: 'Inflação habitação no IHPC',
    real: 12.5,
    realLabel: 'Aumento médio das rendas em Lisboa/Porto',
    unit: '%',
    icon: '🏠',
    color: '#f97316',
    explanation: 'O IHPC inclui na habitação apenas energia e manutenção — não os arrendamentos. Na prática, as rendas em Lisboa e Porto subiram 10-15% em 2025-2026. Quem arrenda paga uma inflação muito superior ao número que aparece nas notícias.',
    source: 'INE / Confidencial Imobiliário 2026',
  },
];

export const EUROSTAT_COICOPS = ['CP00','CP01','CP02','CP03','CP04','CP05','CP06','CP07','CP08','CP09','CP10','CP11','CP12'] as const;
