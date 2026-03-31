export interface DataSource {
  id: string;
  name: string;
  url: string;
  description: string;
  type: 'API' | 'Website';
  isSystemSource: boolean;
  status: 'approved' | 'pending';
  requiresAuth?: boolean;
  authMethod?: 'None' | 'API Key' | 'Bearer Token';
  credentials?: string;
  submittedByName?: string;
  submittedByEmail?: string;
}

export const getSystemDataSources = (t: (key: string) => string): DataSource[] => [
  {
    id: 'pordata',
    name: t('dataSources.pordata.name'),
    url: 'https://www.pordata.pt/',
    description: t('dataSources.pordata.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'ine',
    name: t('dataSources.ine.name'),
    url: 'https://www.ine.pt/',
    description: t('dataSources.ine.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'dgo',
    name: t('dataSources.dgo.name'),
    url: 'https://www.dgo.gov.pt/',
    description: t('dataSources.dgo.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'bportugal',
    name: t('dataSources.bportugal.name'),
    url: 'https://www.bportugal.pt/',
    description: t('dataSources.bportugal.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'eurostat',
    name: t('dataSources.eurostat.name'),
    url: 'https://ec.europa.eu/eurostat',
    description: t('dataSources.eurostat.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'worldbank',
    name: t('dataSources.worldbank.name'),
    url: 'https://data.worldbank.org/',
    description: t('dataSources.worldbank.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'dbnomics',
    name: t('dataSources.dbnomics.name'),
    url: 'https://db.nomics.world/',
    description: t('dataSources.dbnomics.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'rtp',
    name: t('dataSources.rtp.name'),
    url: 'https://www.rtp.pt/noticias/',
    description: t('dataSources.rtp.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'lusa',
    name: t('dataSources.lusa.name'),
    url: 'https://www.lusa.pt/',
    description: t('dataSources.lusa.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'sic',
    name: t('dataSources.sic.name'),
    url: 'https://sicnoticias.pt/',
    description: t('dataSources.sic.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'cnn',
    name: t('dataSources.cnn.name'),
    url: 'https://cnnportugal.iol.pt/',
    description: t('dataSources.cnn.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'publico',
    name: t('dataSources.publico.name'),
    url: 'https://www.publico.pt/',
    description: t('dataSources.publico.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'expresso',
    name: t('dataSources.expresso.name'),
    url: 'https://expresso.pt/',
    description: t('dataSources.expresso.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'observador',
    name: t('dataSources.observador.name'),
    url: 'https://observador.pt/',
    description: t('dataSources.observador.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'tsf',
    name: t('dataSources.tsf.name'),
    url: 'https://www.tsf.pt/',
    description: t('dataSources.tsf.description'),
    type: 'Website',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'alpha-vantage',
    name: t('dataSources.alpha-vantage.name'),
    url: 'https://www.alphavantage.co/',
    description: t('dataSources.alpha-vantage.description'),
    type: 'API',
    isSystemSource: true,
    status: 'approved',
  },
  {
    id: 'financial-modeling-prep',
    name: t('dataSources.financial-modeling-prep.name'),
    url: 'https://site.financialmodelingprep.com/',
    description: t('dataSources.financial-modeling-prep.description'),
    type: 'API',
    isSystemSource: true,
    status: 'approved',
  },
];
