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
  },
  {
    id: 'government-debt-to-gdp',
    title: 'Dívida Pública em % do PIB',
    description: 'Dívida bruta das administrações públicas em percentagem do Produto Interno Bruto. A redução tem sido uma prioridade.',
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
  },
  {
    id: 'live-births-deaths',
    title: 'Nados-vivos e Óbitos',
    description: 'Número total de nados-vivos e óbitos registados em Portugal. O saldo natural (diferença entre nascimentos e mortes) tem sido negativo.',
    category: 'Demografia',
    source: 'INE, Estatísticas Vitais',
    lastUpdated: '2024-05-30',
    dataType: 'table',
    data: [
      { "Ano": 2021, "Nados-vivos": "79.582", "Óbitos": "123.837", "Saldo Natural": "-44.255" },
      { "Ano": 2022, "Nados-vivos": "83.671", "Óbitos": "124.755", "Saldo Natural": "-41.084" },
      { "Ano": 2023, "Nados-vivos": "85.698", "Óbitos": "119.789", "Saldo Natural": "-34.091" }
    ]
  },
  {
    id: 'higher-education-students',
    title: 'Alunos Inscritos no Ensino Superior',
    description: 'Número de alunos inscritos em estabelecimentos de ensino superior em Portugal, por ciclo de estudos.',
    category: 'Educação',
    source: 'DGEEC',
    lastUpdated: '2024-01-15',
    dataType: 'table',
    data: [
      { "Ano Letivo": "2020/2021", "Total": "412.353", "Licenciatura": "237.917", "Mestrado": "127.382", "Doutoramento": "29.981" },
      { "Ano Letivo": "2021/2022", "Total": "433.217", "Licenciatura": "245.891", "Mestrado": "136.314", "Doutoramento": "32.091" },
      { "Ano Letivo": "2022/2023", "Total": "446.028", "Licenciatura": "251.309", "Mestrado": "141.042", "Doutoramento": "33.799" }
    ]
  },
  {
    id: 'doctors-in-nhs',
    title: 'Médicos no Serviço Nacional de Saúde (SNS)',
    description: 'Número de médicos inscritos no SNS em Portugal continental. O número tem vindo a aumentar, mas a distribuição geográfica e por especialidade continua a ser um desafio.',
    category: 'Saúde',
    source: 'INE / Ordem dos Médicos',
    lastUpdated: '2024-02-20',
    dataType: 'table',
    data: [
      { "Ano": 2020, "Número de Médicos": "54.893" },
      { "Ano": 2021, "Número de Médicos": "56.983" },
      { "Ano": 2022, "Número de Médicos": "58.773" }
    ]
  },
  {
    id: 'early-school-leaving',
    title: 'Taxa de Abandono Precoce de Educação e Formação',
    description: 'Percentagem da população dos 18 aos 24 anos que não completou o ensino secundário e que não se encontra a estudar ou a formar-se. Portugal tem feito progressos significativos na redução desta taxa.',
    category: 'Educação',
    source: 'Eurostat / INE',
    lastUpdated: '2024-04-25',
    dataType: 'table',
    data: [
      { "Ano": 2020, "Taxa": "8,9%" },
      { "Ano": 2021, "Taxa": "5,9%" },
      { "Ano": 2022, "Taxa": "6,0%" },
      { "Ano": 2023, "Taxa": "8.0%" }
    ]
  },
  {
    id: 'justice-case-duration',
    title: 'Duração Média dos Processos Judiciais',
    description: 'Tempo médio (em meses) que um processo demora a ser concluído na primeira instância. A pendência processual é um dos principais desafios do sistema de justiça.',
    category: 'Justiça',
    source: 'Direção-Geral da Política de Justiça (DGPJ)',
    lastUpdated: '2023-10-15',
    dataType: 'table',
    data: [
      { "Tipo de Processo": "Ações Cíveis Declarativas", "Duração Média (meses) em 2022": "10" },
      { "Tipo de Processo": "Processos de Insolvência", "Duração Média (meses) em 2022": "27" },
      { "Tipo de Processo": "Processos Executivos", "Duração Média (meses) em 2022": "39" }
    ]
  },
  {
    id: 'emigrants-by-year',
    title: 'Emigrantes Portugueses (Saídas Permanentes)',
    description: 'Estimativa do número de emigrantes permanentes portugueses por ano. Após um pico em 2013, os números têm variado, refletindo as condições económicas em Portugal e no estrangeiro.',
    category: 'Emigração',
    source: 'Observatório da Emigração',
    lastUpdated: '2023-12-10',
    dataType: 'table',
    data: [
      { "Ano": 2020, "Total de Saídas (Estimativa)": "45.000" },
      { "Ano": 2021, "Total de Saídas (Estimativa)": "60.000" },
      { "Ano": 2022, "Total de Saídas (Estimativa)": "66.000" }
    ]
  }
];
