/**
 * articles-static.ts
 *
 * Conteúdo da biblioteca importado estaticamente em build time.
 * Necessário para Cloudflare Workers que não têm acesso ao sistema de ficheiros em runtime.
 *
 * Para adicionar um artigo: adicionar uma entrada ao array ARTICLES_RAW abaixo
 * com o slug e o conteúdo raw MDX (incluindo frontmatter).
 */

import matter from 'gray-matter';

export interface ArticleFrontmatter {
  title: string;
  description: string;
  date: string;
  category: string;
}

export interface ArticleStatic {
  slug: string;
  frontmatter: ArticleFrontmatter;
  content: string;
}

// ---------------------------------------------------------------------------
// Raw MDX content — add new articles here
// ---------------------------------------------------------------------------

const ARTICLES_RAW: { slug: string; raw: string }[] = [
  {
    slug: 'balanca-comercial-e-cambio',
    raw: `---
title: Balança Comercial e Taxas de Câmbio
description: Explore como as exportações, importações e o valor da moeda moldam a relação económica de um país com o resto do mundo.
date: 2024-07-30
category: Macroeconomia
---

## A Economia num Mundo Globalizado

Nenhuma economia moderna funciona de forma isolada. Os países compram e vendem bens e serviços uns aos outros constantemente. A forma como medimos este fluxo de trocas e o valor da nossa moeda em relação a outras são conceitos cruciais para entender a posição de um país no cenário económico global.

---

## A Balança Comercial: O Registo das Trocas

A **Balança Comercial** é um registo contabilístico que mede a diferença entre o valor das **exportações** (bens e serviços que um país vende ao exterior) e o valor das **importações** (bens e serviços que um país compra ao exterior) durante um determinado período.

\`Balança Comercial = Valor das Exportações - Valor das Importações\`

-   **Superavit (ou Excedente) Comercial:** Ocorre quando um país exporta mais do que importa.
-   **Défice (ou Saldo Negativo) Comercial:** Ocorre quando um país importa mais do que exporta.

Para Portugal, membro da União Europeia, uma grande parte das trocas comerciais ocorre dentro do mercado único europeu.

---

## Taxas de Câmbio: O Preço das Moedas

A **taxa de câmbio** é simplesmente o preço de uma moeda em termos de outra. As taxas de câmbio podem ser:

-   **Flexíveis (ou Flutuantes):** O valor da moeda é determinado livremente pela oferta e procura no mercado.
-   **Fixas:** O banco central do país compromete-se a manter o valor da sua moeda fixo em relação a outra moeda.

---

## Como as Taxas de Câmbio Afetam a Economia

-   **Apreciação da Moeda:** As exportações ficam mais caras, as importações mais baratas.
-   **Depreciação da Moeda:** As exportações ficam mais baratas e competitivas, as importações mais caras.

Para os países da Zona Euro, como Portugal, a taxa de câmbio do Euro é gerida pelo Banco Central Europeu.`,
  },
  {
    slug: 'como-funciona-sistema-fiscal',
    raw: `---
title: Como funciona o Sistema Fiscal Português?
description: Um guia exaustivo e dinâmico sobre os principais impostos (IRS, IRC, IVA), o seu papel na economia nacional e o eterno debate entre progressividade e competitividade económica.
date: 2026-03-20
category: Finanças Públicas
---

O Sistema Fiscal é frequentemente visto como uma teia complexa de regras, taxas e acrónimos incompreensíveis. No entanto, é o mecanismo central que garante o funcionamento de um país.

## O Propósito dos Impostos na Sociedade Moderna

O Sistema Fiscal é o mecanismo através do qual os cidadãos e as empresas financiam em conjunto as funções essenciais da sociedade. O grande desafio de qualquer Governo é encontrar o **ponto de equilíbrio ótimo**: tributar o suficiente para garantir o funcionamento do Estado Social, mas não tributar demais ao ponto de sufocar a iniciativa privada.

---

## A Estrutura: Os Grandes Grupos de Impostos em Portugal

### 1. Impostos Diretos (Rendimento e Património)

-   **IRS (Imposto sobre o Rendimento das Pessoas Singulares):** O imposto mais familiar para a maioria dos trabalhadores portugueses, cobrado sobre o rendimento.
-   **IRC (Imposto sobre o Rendimento das Pessoas Coletivas):** Imposto pago pelas empresas sobre os seus lucros líquidos.
-   **Impostos sobre o Património (IMI, IMT e IS):** Impostos sobre a posse e transmissão de imóveis.

### 2. Impostos Indiretos (Consumo e Transações)

-   **IVA (Imposto sobre o Valor Acrescentado):** A principal fonte de receita do Estado, cobrado em todas as transações comerciais a três taxas: 6%, 13% e 23%.
-   **ISP (Imposto sobre os Produtos Petrolíferos):** Forte carga fiscal sobre os combustíveis.
-   **IABA e IT:** Impostos sobre álcool e tabaco com dupla finalidade fiscal e de saúde pública.

---

## O Eterno Paradoxo: Progressividade vs. Competitividade

Qualquer sistema fiscal debate-se com a permanente tensão entre a "Justiça Social" e a "Eficiência Económica". A Teoria da Curva de Laffer postula que, a partir de determinado ponto crítico, aumentar a taxa de imposto começa paradoxalmente a resultar na diminuição da receita total arrecadada.

A literacia fiscal é a base do escrutínio num Estado Democrático maduro.`,
  },
  {
    slug: 'divida-publica',
    raw: `---
title: O que é a Dívida Pública?
description: Uma análise sobre como os governos se financiam, o que é a dívida pública e quais as suas implicações para a economia.
date: 2024-07-25
category: Finanças Públicas
---

## O Orçamento do Estado e a Necessidade de Financiamento

Quando as despesas do Estado são superiores às suas receitas, ocorre um **défice orçamental**. Para cobrir este défice, o Estado precisa de pedir dinheiro emprestado. A Dívida Pública é o montante total de dinheiro que o Estado deve a credores nacionais e internacionais.

---

## Como é que o Estado se Endivida?

O Estado emite instrumentos financeiros, conhecidos como **títulos de dívida pública**:

-   **Obrigações do Tesouro (OT):** Empréstimos de médio e longo prazo.
-   **Bilhetes do Tesouro (BT):** Empréstimos de curto prazo (até um ano).
-   **Certificados de Aforro e Certificados do Tesouro:** Produtos de dívida para a poupança dos cidadãos.

---

## A Dívida em % do PIB

O rácio **Dívida/PIB** é um indicador crucial da capacidade de um país pagar a sua dívida. Um rácio elevado e crescente pode ser um sinal de alerta. O Tratado de Maastricht estabeleceu um valor de referência de 60% para este rácio.

---

## Implicações da Dívida Pública

-   **Custo de Oportunidade:** O dinheiro gasto a pagar juros não pode ser usado para investir em hospitais ou escolas.
-   **Risco de Crise:** Se os investidores perderem confiança, podem exigir juros muito altos, precipitando uma crise financeira.
-   **Transferência Intergeracional:** Uma dívida elevada hoje pode significar impostos mais altos para as gerações futuras.`,
  },
  {
    slug: 'juros-e-politica-monetaria',
    raw: `---
title: Juros e Política Monetária
description: Como os bancos centrais, como o BCE, utilizam as taxas de juro para controlar a inflação, estimular a economia e garantir a estabilidade financeira.
date: 2024-07-27
category: Macroeconomia
---

## O que é a Política Monetária?

A Política Monetária é o conjunto de ações que um banco central implementa para gerir a quantidade de dinheiro em circulação na economia e o custo desse dinheiro (as taxas de juro). O seu objetivo principal é a **estabilidade de preços**.

---

## As Ferramentas do Banco Central: As Taxas de Juro Diretoras

As três principais taxas de juro do BCE são:

1.  **Taxa de Facilidade Permanente de Cedência de Liquidez:** Taxa à qual os bancos podem pedir dinheiro emprestado ao BCE por um dia.
2.  **Taxa das Operações Principais de Refinanciamento:** Taxa à qual os bancos podem pedir dinheiro emprestado ao BCE por uma semana.
3.  **Taxa de Facilidade Permanente de Depósito:** Taxa que os bancos recebem por depositarem dinheiro no BCE.

---

## O Mecanismo de Transmissão

Quando o BCE **sobe as suas taxas de juro**:
-   Créditos ficam mais caros.
-   Menos consumo e investimento.
-   Arrefecimento da economia e controlo da inflação.

Quando o BCE **desce as suas taxas de juro**:
-   Créditos ficam mais baratos.
-   Mais consumo e investimento.
-   Estímulo à economia.

---

## Outras Ferramentas de Política Monetária

-   **Quantitative Easing (QE):** O banco central compra ativos financeiros, injetando dinheiro na economia.
-   **Forward Guidance:** O banco central comunica as suas intenções futuras para influenciar as expectativas.

A gestão da política monetária é um exercício de equilíbrio constante.`,
  },
  {
    slug: 'mercado-de-trabalho',
    raw: `---
title: "Mercado de Trabalho: Emprego e Desemprego"
description: Compreenda os conceitos de população ativa, taxa de desemprego e os diferentes tipos de desemprego que afetam a nossa economia e sociedade.
date: 2024-07-29
category: Economia Social
---

## O Coração da Atividade Económica

O mercado de trabalho é o ambiente onde se encontram a oferta de trabalho (por parte dos trabalhadores) e a procura por trabalho (por parte das empresas).

---

## População Ativa e Inativa

-   **População Ativa:** Inclui todas as pessoas em idade de trabalhar que estão a trabalhar ou a procurar ativamente por trabalho.
-   **População Inativa:** Inclui as pessoas que não estão a trabalhar nem a procurar emprego (estudantes, reformados, etc.).

\`População Ativa = População Empregada + População Desempregada\`

---

## A Taxa de Desemprego

\`Taxa de Desemprego = (População Desempregada / População Ativa) * 100\`

Para ser considerado oficialmente desempregado, um indivíduo tem de estar sem trabalho, disponível para trabalhar e ter procurado ativamente emprego nas últimas semanas.

---

## Tipos de Desemprego

1.  **Desemprego Friccional:** Desemprego de curta duração ao mudar de emprego. Considerado natural numa economia dinâmica.
2.  **Desemprego Estrutural:** Ocorre quando há um desfasamento entre as competências dos trabalhadores e as competências que as empresas procuram.
3.  **Desemprego Cíclico:** Ligado aos ciclos económicos — aumenta nas recessões, diminui nas expansões.

---

## O Pleno Emprego

O conceito de **pleno emprego** corresponde a uma situação onde o desemprego cíclico é nulo, existindo apenas desemprego friccional e estrutural. Este nível é referido como a **Taxa Natural de Desemprego**.`,
  },
  {
    slug: 'modelos-baseados-agentes',
    raw: `---
title: "Uma Alternativa: Modelos Baseados em Agentes (ABM)"
description: Explore os Modelos Baseados em Agentes (ABM), uma abordagem 'bottom-up' para simular sistemas complexos, desde a propagação de doenças a crises financeiras.
date: 2024-08-03
category: Modelos Económicos
---

## Uma Perspetiva Diferente: 'Bottom-Up'

Os **Modelos Baseados em Agentes** (ABM) constroem a simulação a partir do zero (*bottom-up*), simulando o comportamento de agentes individuais e observando os padrões macroeconómicos que emergem das suas interações.

---

## O que é um 'Agente'?

Um agente é uma entidade autónoma com um conjunto de regras de comportamento:
-   Um **indivíduo ou uma família:** que decide o que comprar, onde trabalhar, quando poupar.
-   Uma **empresa:** que decide o que produzir, quanto investir.
-   Um **banco:** que decide a quem emprestar dinheiro.
-   Um **governo ou banco central:** que estabelece regras ou políticas.

---

## A Magia da Emergência

O poder dos ABMs reside no conceito de **emergência**. Fenómenos macroeconómicos complexos emergem das interações locais de milhares de agentes individuais.

**Vantagens dos ABMs:**
-   **Heterogeneidade:** Permitem modelar agentes muito diferentes.
-   **Comportamento Realista:** Incorporam descobertas da economia comportamental.
-   **Redes e Interações:** Excelentes a capturar a importância das redes.

**Desvantagens dos ABMs:**
-   **Intensivos em Computação:** Simular milhões de agentes exige muito poder computacional.
-   **Muitos Parâmetros:** Pode ser difícil calibrar o modelo.
-   **Interpretação:** Por vezes, são vistos como "caixas pretas".

---

## O Papel dos ABMs na Demokratia

Usamos esta abordagem para modelar a desigualdade e analisar efeitos de rede, complementando o nosso modelo macroeconómico principal.`,
  },
  {
    slug: 'modelos-dsge',
    raw: `---
title: O que são os Modelos DSGE?
description: Desmistificando os Modelos de Equilíbrio Geral Dinâmico Estocástico, a ferramenta padrão dos bancos centrais para analisar a economia.
date: 2024-08-02
category: Modelos Económicos
---

## A Espinha Dorsal da Macroeconomia Moderna

Os Modelos de Equilíbrio Geral Dinâmico Estocástico (**DSGE**) representam o padrão da macroeconomia moderna. São utilizados por bancos centrais (BCE, Reserva Federal), governos e instituições internacionais (FMI).

---

## Desmontando a Sigla: D-S-G-E

### Dinâmico (D)
Os modelos analisam a economia **ao longo do tempo**, capturando como as decisões de hoje afetam o futuro.

### Estocástico (S)
O modelo incorpora a **incerteza** e os **choques aleatórios** — choques de produtividade, de política monetária ou de procura.

### Equilíbrio Geral (G)
Analisa a economia como um **todo interligado** — o mercado de trabalho, de bens e financeiro afetam-se mutuamente.

### Equilíbrio (E)
Os agentes económicos tomam decisões de forma **otimizadora**. Os modelos modernos incluem muitas **fricções e rigidezes do mundo real**, como rigidezes nos preços e salários.

---

## Relevância para a Demokratia

Os modelos DSGE fornecem a estrutura teórica e as equações de base para o nosso simulador, garantindo que as nossas simulações respeitam os princípios fundamentais da teoria económica.`,
  },
  {
    slug: 'nossa-metodologia-modelos-hibridos',
    raw: `---
title: "A Nossa Metodologia: Modelos Híbridos de IA"
description: Perceba como a Demokratia combina modelos económicos clássicos com Inteligência Artificial para criar simulações mais realistas e dinâmicas.
date: 2024-08-01
category: Metodologia
---

## O Melhor de Dois Mundos

No coração do simulador da Demokratia está uma abordagem híbrida que une o rigor da teoria económica clássica com o poder de reconhecimento de padrões da Inteligência Artificial (IA).

---

## Os Limites dos Modelos Clássicos

Modelos tradicionais como os **DSGE** fornecem uma estrutura teórica sólida, mas têm:
-   **Pressupostos Rígidos:** Assumem racionalidade perfeita dos agentes.
-   **Lentidão a Adaptar:** Dificuldade em capturar mudanças estruturais súbitas.

---

## Os Limites da Inteligência Artificial Pura

Os modelos de IA são excecionais a encontrar padrões em grandes volumes de dados, mas:
-   **"Caixa Preta":** É difícil perceber *porquê* o modelo chegou a uma determinada conclusão.
-   **Dependência de Dados:** Podem falhar com eventos verdadeiramente novos.

---

## A Abordagem Híbrida da Demokratia

O nosso simulador utiliza um **modelo híbrido**:

1.  **Estrutura Clássica:** Um modelo macroeconómico (inspirado nos DSGE) como espinha dorsal.
2.  **Parâmetros Calibrados por IA:** Algoritmos de IA analisam dados públicos (INE, PORDATA, BCE) em tempo real e calibram os parâmetros do modelo clássico.
3.  **Análise de Comportamento:** A nossa IA analisa também dados não estruturados (notícias, relatórios) para identificar fatores de sentimento.

Ao combinar a teoria económica com a análise de dados em tempo real, procuramos criar um simulador que não só prevê o que pode acontecer, mas também ajuda a explicar o porquê.`,
  },
  {
    slug: 'o-que-e-defice-orcamental',
    raw: `---
title: O que é o Défice Orçamental?
description: Entenda de forma aprofundada o conceito de Défice, como se geram os excedentes, e qual o seu verdadeiro impacto nas contas do Estado e na gigantesca Dívida Pública portuguesa.
date: 2026-03-19
category: Finanças Públicas
---

## 1. O que significa "Estar em Défice"?

O **Défice Orçamental** acontece quando a soma das Despesas Executadas por todas as entidades do Estado superam as Receitas Cobradas (via impostos, taxas e contribuições para a Segurança Social).

Inversamente, quando num ano o Governo cobra mais impostos do que gastou, o país regista um **Superávit**. Quando gasta exatamente o mesmo que obteve, temos um **orçamento absolutamente equilibrado**.

---

## 2. A Relação Causal entre o Défice e a Dívida Pública

-   **O Défice:** É um buraco *anual*. Mede apenas o que decorreu nesse horizonte de doze meses.
-   **A Dívida Pública:** É o peso *histórico* — o acumulado de **todos os défices de todos os Orçamentos de Estado de todos os governos pregressos**.

A lei natural económica funciona de forma impiedosa: **o défice de hoje é a dívida pública de amanhã**.

---

## 3. Saldo Primário vs. Saldo Global

-   **Saldo Primário:** A diferença entre o que o Estado lucra e o que efetivamente gasta para operar o país, *excluindo o pagamento de juros da dívida*.
-   **Saldo Global:** A despesa primária somada à fatura de encargos pelo pagamento dos juros da Dívida Pública.

---

## 4. Por que motivo os Estados geram Défices recorrentes?

1.  **Políticas Contra-Cíclicas:** Em crises, o Estado aumenta a despesa intencionalmente para impulsionar a economia.
2.  **Estrutura Demográfica:** O forte envelhecimento da população aumenta as despesas com pensões e saúde.
3.  **Receita Curta:** Salários baixos e evasão fiscal limitam as receitas do Estado.
4.  **O Ciclo Político:** Anos eleitorais tendem a gerar aumento de despesas.

---

## 5. Regras do Espaço Europeu

O **Pacto de Estabilidade e Crescimento (PEC)** impõe que o Défice Orçamental não pode superar **3% do PIB** e que a Dívida não deve passar de **60% do PIB**.`,
  },
  {
    slug: 'o-que-e-inflacao',
    raw: `---
title: O que é a Inflação?
description: Entenda o que é a inflação, como é medida, as suas causas e os seus efeitos no poder de compra e na economia em geral.
date: 2024-07-26
category: Macroeconomia
---

## O Poder de Compra e a Subida Generalizada dos Preços

**Inflação é a subida generalizada e sustentada dos preços dos bens e serviços numa economia ao longo do tempo.** Quando a inflação ocorre, cada unidade de moeda compra menos bens e serviços — representa uma **diminuição do poder de compra**.

---

## Como se Mede a Inflação? O Índice de Preços no Consumidor (IPC)

Em Portugal e na Zona Euro, a principal medida da inflação é o **Índice de Preços no Consumidor (IPC)**. As autoridades estatísticas definem um "cabaz de compras" que representa os gastos de uma família média, incluindo:

-   Alimentação e bebidas
-   Habitação, água, eletricidade e gás
-   Transportes
-   Saúde
-   Lazer e cultura

---

## Causas da Inflação

1.  **Inflação pela Procura (Demand-Pull):** Ocorre quando a procura agregada é maior do que a oferta disponível.
2.  **Inflação pelo Custo (Cost-Push):** Acontece quando há um aumento nos custos de produção (e.g., subida do preço do petróleo).

---

## O Papel dos Bancos Centrais

O **Banco Central Europeu (BCE)** tem como meta uma taxa de inflação de 2% a médio prazo.

-   **Para combater a inflação alta:** aumentar as taxas de juro.
-   **Para combater a deflação:** baixar as taxas de juro.

Manter uma inflação baixa e estável é essencial para um crescimento económico sustentável.`,
  },
  {
    slug: 'o-que-e-o-orcamento-de-estado',
    raw: `---
title: O que é o Orçamento de Estado?
description: Um guia exaustivo sobre a lei mais importante do país, como é feita, de onde vêm os milhões aprovados e qual o processo democrático que dita a governação e investimentos.
date: 2026-03-20
category: Finanças Públicas
---

## O que é Afinal o OE?

O **Orçamento de Estado (OE)** é a previsão legalmente autorizada de **todas as receitas a cobrar num ano civil** e o teto de todas as despesas essenciais das instituições do Estado.

-   **A Função Macroeconómica:** Regula a conjuntura económica, estimulando consumos com os seus gastos ou restringindo consumos pelas drenagens via taxas.
-   **O Reflexo da Redistribuição:** Opera uma transferência transversal de rendimentos da classe ativa para financiar serviços e pacotes de subsistência das populações mais vulneráveis.
-   **O Contrato Social Escrito:** Traduz numericamente os compromissos políticos assumidos na campanha eleitoral.

---

## Os Grandes Grupos de Despesa

As principais categorias de despesa que consomem a maior parte do orçamento são:

-   **Pensões de Reforma (Segurança Social):** O maior item de despesa.
-   **Funcionários do Estado Central:** Saúde, Educação, Forças Armadas, Polícias.
-   **Juros da Dívida Pública:** A fatura anual dos empréstimos históricos.

---

## Quem aprova o Orçamento de Estado?

-   O **Governo:** Tem exclusividade para entregar a formulação originária do texto à Assembleia da República.
-   A **Assembleia da República:** Vota o documento em Plenário e debate as emendas na especialidade, artigo a artigo.

Sem aprovação parlamentar, o Estado opera em regime de duodécimos — a décima segunda fração do orçamento do ano anterior, mês a mês.`,
  },
  {
    slug: 'o-que-e-pib',
    raw: `---
title: O que é o Produto Interno Bruto (PIB)?
description: Uma explicação fundamental sobre o mais importante indicador da atividade económica de um país.
date: 2024-07-26
category: Macroeconomia
---

## Definição Fundamental

O **Produto Interno Bruto (PIB)** representa o valor monetário total de todos os bens e serviços finais produzidos dentro das fronteiras de um país durante um período de tempo específico. É a medida mais abrangente da atividade económica.

---

## Como se Calcula o PIB?

### 1. A Ótica da Despesa

**PIB = C + I + G + (X - M)**

-   **C (Consumo):** Despesas das famílias.
-   **I (Investimento):** Despesas das empresas em equipamento e construção.
-   **G (Gastos do Governo):** Despesas do Estado em bens e serviços.
-   **(X - M) (Exportações Líquidas):** A diferença entre exportações e importações.

### 2. A Ótica do Rendimento

**PIB = Salários + Juros + Rendas + Lucros**

### 3. A Ótica da Produção

Soma o Valor Acrescentado Bruto (VAB) de todos os setores da economia.

---

## Limitações do PIB

-   **Não mede a Economia Informal:** Atividades não declaradas não são contabilizadas.
-   **Não considera a Distribuição de Riqueza:** Um PIB elevado pode coexistir com grande desigualdade social.
-   **Ignora o Bem-Estar:** Não mede saúde, educação, felicidade ou qualidade ambiental.
-   **Externalidades Negativas:** A poluição não é deduzida do valor da produção.

*Fonte: Baseado em informação da Wikipedia, Banco de Portugal e Pordata.*`,
  },
  {
    slug: 'politica-orcamental',
    raw: `---
title: O que é a Política Orçamental?
description: Descubra como os governos utilizam a despesa pública e os impostos para moldar a economia, promover o crescimento e garantir a estabilidade.
date: 2024-07-28
category: Finanças Públicas
---

## A Outra Alavanca da Economia

A **Política Orçamental** (ou Fiscal) é a principal ferramenta económica nas mãos do **Governo**. Consiste na utilização estratégica da **despesa pública** e dos **impostos** para influenciar a economia.

---

## As Ferramentas da Política Orçamental

1.  **Despesa Pública:** Inclui salários de funcionários públicos, pensões, subsídios sociais e investimento em infraestruturas.
2.  **Impostos:** Incluem impostos diretos (IRS, IRC) e impostos indiretos (IVA).

---

## Política Orçamental Expansionista vs. Contracionista

### Política Expansionista
Utilizada em períodos de recessão. Objetivo: **aumentar a procura agregada**.
-   Aumento da despesa pública ou redução dos impostos.
-   Risco: pode levar a aumento do défice e gerar inflação.

### Política Contracionista
Utilizada quando a inflação é uma preocupação.
-   Redução da despesa pública ou aumento dos impostos.
-   Risco: pode levar a recessão e aumento do desemprego.

---

## O Multiplicador Orçamental

Um aumento na despesa pública de 100 milhões de euros pode gerar um aumento no PIB superior a 100 milhões, através do **efeito multiplicador** — o dinheiro circula e gera rendimentos em cadeia.

Gerir a política orçamental é um ato de equilíbrio complexo entre estimular a economia a curto prazo e garantir a sustentabilidade das finanças públicas a longo prazo.`,
  },
  {
    slug: 'produtividade-e-crescimento',
    raw: `---
title: Produtividade e Crescimento Económico
description: A produtividade é o verdadeiro motor do crescimento a longo prazo e da melhoria do nível de vida. Entenda porquê e como pode ser impulsionada.
date: 2024-07-31
category: Macroeconomia
---

## O Segredo para a Riqueza de um País

O crescimento económico é geralmente medido pela variação percentual do PIB real. O principal motor deste crescimento a longo prazo é a **produtividade**.

---

## O que é a Produtividade?

A produtividade mede a eficiência com que os recursos são utilizados para produzir bens e serviços.

\`Produtividade do Trabalho = PIB / Número de Horas Trabalhadas\`

Um aumento da produtividade significa que, com a mesma quantidade de trabalho, a economia consegue gerar mais valor — é a única forma sustentável de aumentar a riqueza de um país.

---

## Os Motores da Produtividade

1.  **Capital Físico:** Stock de equipamentos, máquinas, edifícios e infraestruturas.
2.  **Capital Humano:** Conhecimento, competências e saúde dos trabalhadores.
3.  **Tecnologia e Inovação:** O fator mais importante a longo prazo.
4.  **Recursos Naturais:** Importantes, mas não determinantes para a riqueza a longo prazo.
5.  **Qualidade das Instituições:** Um ambiente de negócios estável com respeito pelos contratos e pouca corrupção.

---

## Porque é que a Produtividade é Tão Importante?

-   **Aumenta os Salários Reais:** Os salários só podem aumentar sustentavelmente se a produtividade também aumentar.
-   **Melhora o Nível de Vida:** Mais riqueza traduz-se em melhores serviços públicos e maior acesso a bens.
-   **Aumenta a Competitividade:** Países mais produtivos competem melhor no mercado global.`,
  },
];

// ---------------------------------------------------------------------------
// Parse and export
// ---------------------------------------------------------------------------

function parseArticle(slug: string, raw: string): ArticleStatic {
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as ArticleFrontmatter,
    content,
  };
}

const _parsed = ARTICLES_RAW.map(({ slug, raw }) => parseArticle(slug, raw));

export function getAllArticlesStatic(): { slug: string; frontmatter: ArticleFrontmatter }[] {
  return _parsed
    .map(({ slug, frontmatter }) => ({ slug, frontmatter }))
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

export function getArticleBySlugStatic(slug: string): ArticleStatic | null {
  return _parsed.find((a) => a.slug === slug) ?? null;
}
