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
    id: 'state-budget-2024-spending',
    title: 'Orçamento do Estado 2024: Despesa por Missão',
    description: 'Distribuição da despesa total consolidada do Orçamento do Estado por grandes missões orgânicas. Estes valores representam o esforço financeiro do Estado em áreas críticas.',
    category: 'Estado',
    source: 'DGO - Direção-Geral do Orçamento / OE 2024',
    lastUpdated: '2024-01-01',
    dataType: 'table',
    data: [
      { "Missão": "Segurança Social e Solidariedade", "Valor (Mil Milhões €)": 23.5, "% do Total": "32.1%" },
      { "Missão": "Saúde (SNS)", "Valor (Mil Milhões €)": 15.6, "% do Total": "21.3%" },
      { "Missão": "Educação e Ensino Superior", "Valor (Mil Milhões €)": 10.2, "% do Total": "13.9%" },
      { "Missão": "Operações da Dívida Pública", "Valor (Mil Milhões €)": 7.4, "% do Total": "10.1%" },
      { "Missão": "Segurança e Ordem Pública", "Valor (Mil Milhões €)": 2.8, "% do Total": "3.8%" },
      { "Missão": "Defesa Nacional", "Valor (Mil Milhões €)": 2.1, "% do Total": "2.9%" }
    ]
  },
  {
    id: 'population-by-age',
    title: 'População Residente por Grupo Etário',
    description: 'Distribuição da população residente em Portugal por grandes grupos etários. O índice de envelhecimento atingiu os 182,1 em 2021.',
    category: 'Demografia',
    source: 'INE, Censos 2021',
    lastUpdated: '2022-12-15',
    dataType: 'table',
    data: [
      { "Grupo Etário": "0-14 anos", "População": "1.336.874", "Percentagem": "12,9%" },
      { "Grupo Etário": "15-24 anos", "População": "1.076.017", "Percentagem": "10,4%" },
      { "Grupo Etário": "25-64 anos", "População": "5.451.933", "Percentagem": "52,5%" },
      { "Grupo Etário": "65+ anos", "População": "2.424.123", "Percentagem": "23,4%" }
    ]
  },
  {
    id: 'companies-by-size',
    title: 'Empresas por Escalão de Pessoal',
    description: 'Número de sociedades não financeiras em Portugal. As microempresas representam a esmagadora maioria do tecido empresarial.',
    category: 'Economia',
    source: 'INE, Empresas em Portugal 2021',
    lastUpdated: '2023-07-20',
    dataType: 'table',
    data: [
      { "Escalão": "0 trabalhadores", "Número de Empresas": "634.867" },
      { "Escalão": "1 a 9 trabalhadores", "Número de Empresas": "648.351" },
      { "Escalão": "10 a 49 trabalhadores", "Número de Empresas": "85.732" },
      { "Escalão": "50 a 249 trabalhadores", "Número de Empresas": "12.945" },
      { "Escalão": "250 ou mais trabalhadores", "Número de Empresas": "2.043" }
    ]
  },
  {
    id: 'poverty-risk',
    title: 'Taxa de Risco de Pobreza (AROPE)',
    description: 'Percentagem da população em risco de pobreza ou exclusão social.',
    category: 'Sociedade',
    source: 'INE, ICVR',
    lastUpdated: '2023-11-28',
    dataType: 'table',
    data: [
      { "Ano": 2020, "Taxa AROPE": "22,4%" },
      { "Ano": 2021, "Taxa AROPE": "22,4%" },
      { "Ano": 2022, "Taxa AROPE": "19,4%" },
      { "Ano": 2023, "Taxa AROPE": "17,0%" }
    ]
  },
  {
    id: 'average-salary',
    title: 'Ganho Médio Mensal por Trabalhador',
    description: 'Valor do ganho médio mensal bruto por trabalhador por conta de outrem.',
    category: 'Economia',
    source: 'INE',
    lastUpdated: '2024-03-05',
    dataType: 'table',
    data: [
      { "Ano": 2021, "Ganho Médio Mensal": "1.365 €" },
      { "Ano": 2022, "Ganho Médio Mensal": "1.411 €" },
      { "Ano": 2023, "Ganho Médio Mensal": "1.505 €" }
    ]
  },
  {
    id: 'government-debt-to-gdp',
    title: 'Dívida Pública em % do PIB',
    description: 'Dívida bruta das administrações públicas em percentagem do PIB.',
    category: 'Economia',
    source: 'Eurostat / Banco de Portugal',
    lastUpdated: '2024-04-22',
    dataType: 'table',
    data: [
      { "Ano": 2020, "Dívida (% PIB)": "134,9%" },
      { "Ano": 2021, "Dívida (% PIB)": "124,5%" },
      { "Ano": 2022, "Dívida (% PIB)": "112,4%" },
      { "Ano": 2023, "Dívida (% PIB)": "99,1%" }
    ]
  }
];