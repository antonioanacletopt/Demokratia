# **App Name**: Demokratia Portugal

## Core Features:

- Simulador Económico Data-Driven: Uma ferramenta que permite aos utilizadores introduzir variáveis políticas hipotéticas e visualizar o seu impacto económico simulado, utilizando dados reais de fontes portuguesas e internacionais. A ferramenta usa raciocínio para decidir quando ou se deve incorporar informações no resultado.
- Explorador de Dados Públicos: Uma interface intuitiva para explorar e compreender dados económicos e sociais em tempo real.
- Perfil de Utilizador e Definições: Funcionalidades básicas de gestão de utilizadores, incluindo criação de perfil, ajustes de definições e autenticação segura.

## Estratégia de Integração de Dados (Plano de Ação Revisto):

O objetivo é construir um sistema de dados resiliente e abrangente, utilizando múltiplas fontes de API para evitar os limites de uma única fonte e garantir a melhor qualidade de dados para cada categoria.

**Arquitetura de Dados Inteligente:**

A aplicação irá priorizar fontes de API sempre que possível, recorrendo ao scraping de websites como um fallback robusto. Esta abordagem híbrida garante a continuidade dos dados mesmo quando as APIs falham ou atingem os seus limites.

- **Fontes Primárias:** APIs (Alpha Vantage, Financial Modeling Prep, etc.)
- **Fontes Secundárias:** Web Scraping (Pordata, INE, etc.)
- **Mecanismo de Fallback:** Se uma chamada de API falhar, o sistema tentará automaticamente obter os dados através de scraping do website correspondente.

## Padrões de Desenvolvimento Frontend

### Internacionalização (i18n)

Para garantir a consistência e a correta configuração em todo o projeto, todos os componentes React que necessitem de tradução de texto **devem** obrigatoriamente utilizar o hook `useTranslation` proveniente do módulo de i18n local. A importação correta é:

`import { useTranslation } from '@/lib/i18n';`

A importação direta da biblioteca `react-i18next` é estritamente desaconselhada para evitar inconsistências e possíveis erros de configuração.
