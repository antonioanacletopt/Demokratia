# **App Name**: Demokratia Portugal

## Core Features:

- Simulador Económico Data-Driven: Uma ferramenta que permite aos utilizadores introduzir variáveis políticas hipotéticas e visualizar o seu impacto económico simulado, utilizando dados reais de fontes portuguesas e internacionais. A ferramenta usa raciocínio para decidir quando ou se deve incorporar informações no resultado.
- Explorador de Dados Públicos: Uma interface intuitiva para explorar e compreender dados económicos e sociais em tempo real.
- Perfil de Utilizador e Definições: Funcionalidades básicas de gestão de utilizadores, incluindo criação de perfil, ajustes de definições e autenticação segura.

## Estratégia de Integração de Dados (Plano de Ação Revisto):

O objetivo é construir um sistema de dados resiliente e abrangente, utilizando múltiplas fontes de API para evitar os limites de uma única fonte e garantir a melhor qualidade de dados para cada categoria.

**Arquitetura de Dados Inteligente:**

- Cada fonte de dados no sistema (`src/lib/system-data-sources.ts`) será classificada com `dataCategories` (ex: `"Cotações de Ações"`, `"Dados Macroeconómicos"`).
- Esta classificação permitirá que a IA do sistema identifique autonomamente a fonte de dados mais apropriada para responder a um pedido específico do utilizador, otimizando a eficiência e a precisão.

**Fase 1: Resiliência da API de Cotações de Ações**

1.  **Investigar e Integrar Nova Fonte Gratuita:**
    -   **Objetivo:** Encontrar e integrar uma API ou método de acesso gratuito e fiável para cotações de ações da Euronext Lisbon.
    -   **Candidato Principal:** `Yahoo Finance (via métodos não-oficiais)`.
    -   **Ação:** Investigar os "endpoints" não-oficiais do Yahoo Finance para validar a cobertura de dados (Euronext Lisbon) e a sua fiabilidade. Se for viável, integrar no `api-client.ts`.

2.  **Manter Alpha Vantage (com Fallback):**
    -   **Objetivo:** Manter a Alpha Vantage como fonte primária ou secundária, implementando um mecanismo de fallback entre o Yahoo Finance e a Alpha Vantage para máxima resiliência.

**Fase 2: Expansão com Dados Macroeconómicos e Sociais (Core Business)**

3.  **Integrar DBnomics:**
    -   **Objetivo:** Adicionar a DBnomics como a principal fonte para dados económicos e sociais de alta qualidade, que são cruciais para o "Explorador de Dados Públicos" e o "Simulador Económico".
    -   **Ação:** Criar novas funções no `api-client` para buscar séries de dados macroeconómicos relevantes.

4.  **Integrar Eurostat e Banco Mundial:**
    -   **Objetivo:** Complementar os dados da DBnomics com outras fontes macroeconómicas globais.

**Fase 3: Foco em Dados Nacionais**

5.  **Integrar Fontes Portuguesas (INE, Pordata, DGO):**
    -   **Objetivo:** Incorporar dados oficiais de Portugal para garantir a máxima precisão e relevância para o contexto nacional.
    -   **Ação:** Desenvolver conectores específicos para estas fontes.

---

## Anexo: Inventário de Recursos de APIs

### Financial Modeling Prep (Plano Gratuito)
- **Cotações de Ações:** Limitado a mercados principais (ex: NASDAQ). Acesso à Euronext Lisbon requer plano pago.
- **Recursos Gratuitos Úteis:**
  - `/stock-list`: Lista completa de tickers disponíveis.
  - `/search-name?query={name}`: Ferramenta de pesquisa para encontrar tickers.
  - `/profile?symbol={symbol}`: Dados de perfil para empresas em mercados gratuitos.
  - `/historical-price-eod/full?symbol={symbol}`: Dados históricos de fecho de dia para mercados gratuitos.
