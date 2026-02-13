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
    id: 'population-by-age',
    title: 'População Residente por Grupo Etário',
    description: 'Distribuição da população residente em Portugal por grandes grupos etários. O índice de envelhecimento (população com 65+ anos por cada 100 jovens) atingiu os 182,1 em 2021.',
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
    description: 'Número de sociedades não financeiras em Portugal, distribuídas por escalão de número de trabalhadores. As microempresas (0 a 9 trabalhadores) representam a esmagadora maioria do tecido empresarial.',
    category: 'Economia',
    source: 'INE, Empresas em Portugal 2021',
    lastUpdated: '2023-07-20',
    dataType: 'table',
    data: [
      { "Escalão": "0 trabalhadores (Sem pessoal ao serviço)", "Número de Empresas": "634.867" },
      { "Escalão": "1 a 9 trabalhadores (Microempresas)", "Número de Empresas": "648.351" },
      { "Escalão": "10 a 49 trabalhadores (Pequenas empresas)", "Número de Empresas": "85.732" },
      { "Escalão": "50 a 249 trabalhadores (Médias empresas)", "Número de Empresas": "12.945" },
      { "Escalão": "250 ou mais trabalhadores (Grandes empresas)", "Número de Empresas": "2.043" }
    ]
  },
  {
    id: 'poverty-risk',
    title: 'Taxa de Risco de Pobreza ou Exclusão Social (AROPE)',
    description: 'Percentagem da população que se encontra em risco de pobreza, em privação material e social severa ou a viver em agregados com intensidade laboral per capita muito reduzida.',
    category: 'Sociedade',
    source: 'INE, Inquérito às Condições de Vida e Rendimento',
    lastUpdated: '2023-11-28',
    dataType: 'table',
    data: [
      { "Ano": 2020, "Taxa AROPE": "22,4%", "Notas": "Impacto inicial da pandemia" },
      { "Ano": 2021, "Taxa AROPE": "22,4%", "Notas": "Manutenção da taxa" },
      { "Ano": 2022, "Taxa AROPE": "19,4%", "Notas": "Redução significativa" },
      { "Ano": 2023, "Taxa AROPE": "17,0%", "Notas": "Melhoria contínua" }
    ]
  },
  {
    id: 'average-salary',
    title: 'Ganho Médio Mensal por Trabalhador',
    description: 'Valor do ganho médio mensal bruto por trabalhador por conta de outrem (inclui prémios, subsídios, etc.).',
    category: 'Economia',
    source: 'INE, Inquérito aos Ganhos e Duração do Trabalho',
    lastUpdated: '2024-03-05',
    dataType: 'table',
    data: [
      { "Ano": 2021, "Ganho Médio Mensal": "1.365 €" },
      { "Ano": 2022, "Ganho Médio Mensal": "1.411 €" },
      { "Ano": 2023, "Ganho Médio Mensal": "1.505 €" }
    ]
  },
  {
    id: 'foreign-population',
    title: 'População Estrangeira Residente',
    description: 'Número de cidadãos de nacionalidade estrangeira com estatuto legal de residência em Portugal. Não inclui pessoas em situação irregular ou com dupla nacionalidade.',
    category: 'Demografia',
    source: 'SEF / AIMA',
    lastUpdated: '2024-06-03',
    dataType: 'table',
    data: [
        { "Ano": 2020, "População": "662.095" },
        { "Ano": 2021, "População": "698.887" },
        { "Ano": 2022, "População": "781.915" },
        { "Ano": 2023, "População": "1.040.000 (Estimativa)" }
    ]
  }
];
