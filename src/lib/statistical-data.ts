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
    id: 'average-monthly-earnings-2026',
    title: 'Ganho Médio Mensal por Trabalhador',
    description: 'Evolução do ganho médio mensal bruto dos trabalhadores por conta de outrem. Em 2026, observa-se uma convergência com a média europeia após as atualizações do SMN.',
    category: 'Economia',
    source: 'INE / Ministério do Trabalho 2026',
    lastUpdated: '2026-02-15',
    dataType: 'table',
    data: [
      { "Ano": 2024, "Ganho Médio (€)": 1465, "Variação": "+4.2%" },
      { "Ano": 2025, "Ganho Médio (€)": 1530, "Variação": "+4.4%" },
      { "Ano": 2026, "Ganho Médio (€)": 1610, "Variação": "+5.2%" }
    ]
  },
  {
    id: 'companies-by-size-2026',
    title: 'Empresas por Escalão de Pessoal',
    description: 'Distribuição do tecido empresarial português por número de trabalhadores em 2026. Destaque para o crescimento das médias empresas tecnológicas.',
    category: 'Economia',
    source: 'INE / Banco de Portugal 2026',
    lastUpdated: '2026-03-01',
    dataType: 'table',
    data: [
      { "Escalão": "Micro (0-9)", "Nº Empresas": 1245000, "% do Total": "96.1%" },
      { "Escalão": "Pequenas (10-49)", "Nº Empresas": 42000, "% do Total": "3.2%" },
      { "Escalão": "Médias (50-249)", "Nº Empresas": 6800, "% do Total": "0.5%" },
      { "Escalão": "Grandes (250+)", "Nº Empresas": 1200, "% do Total": "0.2%" }
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
      { "Ano": 2021, "Dívida (% PIB)": "124.5%" },
      { "Ano": 2022, "Dívida (% PIB)": "112.4%" },
      { "Ano": 2023, "Dívida (% PIB)": "99.1%" },
      { "Ano": 2024, "Dívida (% PIB)": "95.4%" },
      { "Ano": 2025, "Dívida (% PIB)": "91.2%" },
      { "Ano": 2026, "Dívida (% PIB)": "88.5%" }
    ]
  },
  {
    id: 'residence-permits-2026',
    title: 'Títulos de Residência Emitidos e Renovados',
    description: 'Estatísticas sobre a emissão e renovação de títulos de residência em Portugal. Dados de 2026 refletem a agilização dos processos de integração e o reforço da capacidade de resposta da agência.',
    category: 'Migrações',
    source: 'AIMA - Agência para a Integração, Migrações e Asilo 2026',
    lastUpdated: '2026-03-10',
    dataType: 'table',
    data: [
      { "Tipo": "Novos Títulos", "Quantidade": 145000, "Estado": "Processado" },
      { "Tipo": "Renovações", "Quantidade": 280000, "Estado": "Concluído" },
      { "Tipo": "CPLP (Regime Especial)", "Quantidade": 95000, "Estado": "Simplificado" }
    ]
  },
  {
    id: 'doctors-sns-2026',
    title: 'Médicos no Serviço Nacional de Saúde (SNS)',
    description: 'Número de médicos nos quadros do SNS por especialidade. Reflete o reforço orçamental de 2026 para a retenção de talentos.',
    category: 'Saúde',
    source: 'Portal da Transparência SNS 2026',
    lastUpdated: '2026-01-20',
    dataType: 'table',
    data: [
      { "Especialidade": "Medicina Geral e Familiar", "Nº Médicos": 6450, "Estado": "Reforçado" },
      { "Especialidade": "Medicina Interna", "Nº Médicos": 2800, "Estado": "Estável" },
      { "Especialidade": "Pediatria", "Nº Médicos": 1450, "Estado": "Em carência" },
      { "Especialidade": "Cirurgia Geral", "Nº Médicos": 1200, "Estado": "Estável" }
    ]
  },
  {
    id: 'early-school-leaving-2026',
    title: 'Taxa de Abandono Precoce de Educação e Formação',
    description: 'Percentagem de jovens (18-24 anos) que não concluíram o ensino secundário. Portugal atinge mínimos históricos em 2026.',
    category: 'Educação',
    source: 'DGEEC / Eurostat 2026',
    lastUpdated: '2026-02-28',
    dataType: 'table',
    data: [
      { "Ano": 2023, "Taxa (%)": 8.0 },
      { "Ano": 2024, "Taxa (%)": 7.4 },
      { "Ano": 2025, "Taxa (%)": 6.8 },
      { "Ano": 2026, "Taxa (%)": 6.2 }
    ]
  },
  {
    id: 'higher-education-enrollment-2026',
    title: 'Alunos Inscritos no Ensino Superior',
    description: 'Número total de alunos inscritos em universidades e politécnicos. Crescimento impulsionado por cursos de IA e Transição Energética.',
    category: 'Educação',
    source: 'DGEEC / MCTES 2026',
    lastUpdated: '2026-01-30',
    dataType: 'table',
    data: [
      { "Subsistema": "Universitário Público", "Inscritos": 245000 },
      { "Subsistema": "Politécnico Público", "Inscritos": 128000 },
      { "Subsistema": "Privado", "Inscritos": 82000 }
    ]
  },
  {
    id: 'emigration-stats-2026',
    title: 'Fluxos de Emigração e Regresso',
    description: 'Estatísticas de saída de cidadãos nacionais e o impacto do programa "Regressar 2.0" em 2026.',
    category: 'Emigração',
    source: 'Observatório da Emigração 2026',
    lastUpdated: '2026-03-05',
    dataType: 'table',
    data: [
      { "Fluxo": "Emigração Permanente", "Nº Pessoas": 62000, "Tendência": "Queda" },
      { "Fluxo": "Regresso de Nacionais", "Nº Pessoas": 38000, "Tendência": "Subida" },
      { "Fluxo": "Saldo Líquido", "Nº Pessoas": -24000, "Tendência": "Melhoria" }
    ]
  }
];