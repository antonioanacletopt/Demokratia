import { z } from 'zod';

export const consultLegislationInputSchema = z.object({
  question: z.string().describe("A pergunta do utilizador sobre a legislação portuguesa."),
});

export const consultLegislationOutputSchema = z.object({
  answer: z.string().describe("Uma resposta clara e concisa à pergunta, baseada na legislação em vigor."),
  sources: z.array(z.string().url()).describe("Uma lista de URLs para as fontes legais oficiais (ex: Diário da República) que fundamentam a resposta."),
});

export const factCheckInputSchema = z.object({
  claim: z.string().describe("A alegação ou afirmação a ser verificada."),
});

export const factCheckOutputSchema = z.object({
  verdict: z.enum(['true', 'false', 'misleading', 'no_evidence']).describe("O veredito final sobre a alegação."),
  explanation: z.string().describe("Uma explicação detalhada e fundamentada para o veredito, citando o raciocínio e as provas."),
  sources: z.array(z.string().url()).describe("Uma lista de URLs de fontes fiáveis que suportam a análise."),
});

export const simulationResultSchema = z.object({
  title: z.string().describe('Um título conciso e informativo para a simulação.'),
  summary: z.string().describe('Um resumo executivo da análise de impacto (2-3 frases).'),
  positiveImpacts: z.array(z.string()).describe('Uma lista de potenciais impactos positivos.'),
  negativeImpacts: z.array(z.string()).describe('Uma lista de potenciais impactos negativos.'),
  longTermOutlook: z.string().describe('A perspetiva a longo prazo e os efeitos secundários.'),
  assumptions: z.array(z.string()).describe('As principais suposições feitas para a análise.'),
  confidenceScore: z.number().min(0).max(1).describe('A confiança do modelo na análise (0 a 1).'),
  sources: z.array(z.string()).describe('Uma lista de fontes de dados e referências usadas.'),
});

export const dataExplorerResultSchema = z.object({
  title: z.string().describe('Um título para a visualização de dados.'),
  chartType: z.enum(['bar', 'line', 'pie', 'table']).describe('O tipo de gráfico mais adequado.'),
  data: z.any().describe('Os dados para o gráfico (formato compatível com Recharts).'),
  interpretation: z.string().describe('Uma breve análise e interpretação dos dados.'),
  source: z.string().describe('A fonte principal dos dados.'),
});

export const scenarioInputSchema = z.object({
  parameters: z.object({
    irs: z.number(),
    iva: z.number(),
    irc: z.number(),
    investment: z.number(),
    smn: z.number(),
    budget: z.object({
      health: z.number(),
      education: z.number(),
      social: z.number(),
      defense: z.number(),
      infra: z.number(),
    })
  }),
  results: z.object({
    gdp: z.number(),
    unemployment: z.number(),
    inflation: z.number(),
    debt: z.number(),
    balance: z.number(),
  })
});

export const scenarioAnalysisResultSchema = z.object({
  feedback: z.string().describe('Análise de IA sobre o cenário macroeconómico e orçamental submetido pelo utilizador.'),
});

export const irsAssessmentInputSchema = z.object({
  maritalStatus: z.enum(['Single', 'Married_Joint', 'Married_Separate']).describe("Estado civil do contribuinte."),
  dependents: z.number().int().min(0).describe("Número de dependentes."),
  income: z.object({
    categoryA: z.number().min(0).describe("Rendimento bruto da Categoria A (Trabalho Dependente)."),
    categoryB: z.number().min(0).describe("Rendimento bruto da Categoria B (Trabalho Independente)."),
    property: z.number().min(0).describe("Rendimentos prediais (Categoria F)."),
    capital: z.number().min(0).describe("Rendimentos de capitais (Categoria E)."),
  }),
  capitalGains: z.optional(z.object({
    realizationValue: z.number().min(0),
    acquisitionValue: z.number().min(0),
    expenses: z.number().min(0),
    isPrimaryResidence: z.boolean(),
    reinvestmentValue: z.number().min(0).optional(),
  })).describe("Detalhes de mais-valias imobiliárias (Categoria G)."),
  englobePropertyIncome: z.boolean().describe("Opção de englobamento para rendimentos prediais."),
  englobeCapitalIncome: z.boolean().describe("Opção de englobamento para rendimentos de capitais."),
  irsJovemYear: z.enum(['Nenhum', 'Ano 1', 'Ano 2', 'Ano 3', 'Ano 4', 'Ano 5']).describe("Ano de aplicação do regime IRS Jovem."),
  expenses: z.object({
    health: z.number().min(0),
    education: z.number().min(0),
    housing: z.number().min(0),
    general: z.number().min(0),
    donations: z.number().min(0),
    alimony: z.number().min(0),
    unionFees: z.number().min(0),
    vatOnInvoices: z.number().min(0),
    careHomes: z.number().min(0),
  }),
  disability: z.object({
    taxpayer: z.boolean(),
    spouse: z.boolean(),
    dependents: z.number().int().min(0),
  }).describe("Informações sobre incapacidade."),
  ppr: z.number().min(0).describe("Valor aplicado em Planos Poupança-Reforma (PPR)."),
  retention: z.number().min(0).describe("Retenção na fonte total."),
});

export const irsAssessmentOutputSchema = z.object({
  refundOrPayment: z.number().describe("O valor a receber (positivo) ou a pagar (negativo)."),
  estimatedTax: z.number().describe("O valor total do imposto a pagar (coleta líquida)."),
  effectiveRate: z.number().describe("A taxa efetiva de IRS em percentagem."),
  analysis: z.string().describe("Análise detalhada do resultado, explicando os principais fatores."),
  tips: z.array(z.string()).describe("Lista de dicas de otimização fiscal personalizadas."),
});

export const newsFeedItemSchema = z.object({
  id: z.string().describe('Um ID único para o item do feed.'),
  title: z.string().describe('O título da notícia ou alegação.'),
  description: z.string().describe('Um resumo da notícia.'),
  source: z.string().describe('A fonte da informação (ex: "ECO", "Público").'),
  date: z.string().describe('A data da publicação no formato "DD de MMMM de YYYY".'),
  type: z.enum(['claim', 'new_law', 'analysis']).describe('O tipo de item do feed.'),
  actionLink: z.object({
    href: z.string().describe('O URL INTERNO para a ação. APENAS são válidos os seguintes formatos: "/simulations?policy=<texto_da_politica_url_encoded>" ou "/fact-check?claim=<texto_da_alegacao_url_encoded>". NÃO usar outras rotas como /resources, /explorer, /budget, etc.'),
    label: z.string().describe('O texto para o botão de ação (ex: "Simular Impacto").'),
  }).optional(),
});

export const newsFeedOutputSchema = z.object({
  feedItems: z.array(newsFeedItemSchema)
});

export const publicStatisticSchema = z.object({
  isFound: z.boolean().describe("Indica se os dados estatísticos foram encontrados."),
  data: z.string().optional().describe("Os dados encontrados, em formato JSON stringified. Omita se não for encontrado."),
  source: z.string().optional().describe("A URL ou nome da fonte dos dados (ex: INE, Pordata, Eurostat). Omita se não for encontrado."),
  explanation: z.string().optional().describe("Uma breve explicação sobre os dados ou porque não foram encontrados.")
});

export const chartOutputSchema = z.object({
  isChartable: z.boolean().describe("Indica se o pedido do utilizador pode ser convertido num gráfico de barras ou linhas."),
  chartTitle: z.string().optional().describe("Um título curto e informativo para o gráfico."),
  chartType: z.enum(['bar', 'line']).optional().describe("O tipo de gráfico a ser renderizado."),
  yAxisLabel: z.string().optional().describe("O rótulo para o eixo Y (ex: 'Milhões de €', '%', 'Taxa de Crescimento')."),
  explanation: z.string().describe("Uma explicação concisa sobre os dados ou porque não puderam ser visualizados."),
  chartData: z.array(z.object({
    label: z.string().describe("O rótulo para uma barra ou ponto na linha (ex: Ano, País, Categoria)."),
    value: z.number().describe("O valor numérico correspondente ao rótulo."),
  })).optional().describe("Uma lista de objetos de dados para o gráfico. Omita se isChartable for falso.")
});

export const familyBudgetInputSchema = z.object({
  budget: z.object({
    profile: z.object({
      adults: z.number().int().min(1).describe("Número de adultos no agregado."),
      children: z.number().int().min(0).describe("Número de crianças no agregado."),
      totalNetIncome: z.number().min(0).describe("Rendimento líquido mensal total do agregado.")
    }),
    expenses: z.record(z.string(), z.number().min(0)).describe("Um objeto com as várias categorias de despesa e os seus valores orçamentados.")
  })
});

export const familyBudgetAnalysisSchema = z.object({
  analysis: z.string().describe("Uma análise detalhada do orçamento familiar, apontando pontos fortes e fracos."),
  tips: z.array(z.string()).describe("Uma lista de sugestões acionáveis e personalizadas para otimização do orçamento.")
});

export const marketAnalysisInputSchema = z.object({
  asset: z.string().describe("O ativo ou setor de mercado a ser analisado (ex: 'S&P 500', 'Ouro', 'Imobiliário em Lisboa')."),
  timeHorizon: z.string().describe("O horizonte temporal para a análise (ex: 'Curto Prazo', 'Longo Prazo')."),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']).describe("O perfil de risco do investidor."),
});

export const marketAnalysisOutputSchema = z.object({
  summary: z.string().describe("Um resumo da análise de mercado (2-3 frases)."),
  outlook: z.enum(['bullish', 'bearish', 'neutral']).describe("A perspetiva geral para o ativo."),
  confidence: z.number().min(0).max(1).describe("A confiança do modelo na análise (0 a 1)."),
  keyFactors: z.array(z.string()).describe("Fatores chave que influenciam a perspetiva."),
  suggestedAction: z.string().describe("Uma sugestão de ação baseada na análise (ex: 'Acumular', 'Manter', 'Reduzir Exposição')."),
});
