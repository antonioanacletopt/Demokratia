export interface DataSource {
  id: string;
  name: string;
  url: string;
  type: 'API' | 'Website';
  description: string;
  requiresAuth: boolean;
  authMethod: 'None' | 'API Key' | 'Bearer Token';
  credentials?: string;
  isSystemSource: boolean;
}

export const systemDataSources: Omit<DataSource, 'id' | 'credentials'>[] = [
  {
    name: 'INE - Instituto Nacional de Estatística',
    url: 'https://www.ine.pt',
    type: 'Website',
    description: 'Principal produtor de estatísticas oficiais em Portugal.',
    requiresAuth: false,
    authMethod: 'None',
    isSystemSource: true,
  },
  {
    name: 'Pordata',
    url: 'https://www.pordata.pt',
    type: 'Website',
    description: 'Base de dados sobre Portugal com estatísticas da sociedade.',
    requiresAuth: false,
    authMethod: 'None',
    isSystemSource: true,
  },
  {
    name: 'Banco de Portugal',
    url: 'https://www.bportugal.pt/estatisticas',
    type: 'Website',
    description: 'Fonte para estatísticas monetárias e financeiras.',
    requiresAuth: false,
    authMethod: 'None',
    isSystemSource: true,
  },
  {
    name: 'Eurostat',
    url: 'https://ec.europa.eu/eurostat/data/database',
    type: 'Website',
    description: 'Serviço de estatística da União Europeia.',
    requiresAuth: false,
    authMethod: 'None',
    isSystemSource: true,
  },
  {
    name: 'Diário da República Eletrónico',
    url: 'https://diariodarepublica.pt',
    type: 'Website',
    description: 'Fonte oficial para toda a legislação e atos do governo.',
    requiresAuth: false,
    authMethod: 'None',
    isSystemSource: true,
  },
];

    