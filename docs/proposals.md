# Propostas de Funcionalidades para a Demokratia

Este documento regista as ideias e propostas para futuras funcionalidades da aplicação, como discutido.

## 1. Dashboards Personalizados

-   **Descrição:** Permitir que utilizadores autenticados possam guardar as suas visualizações de dados e gráficos preferidos num dashboard pessoal.
-   **Objetivo:** Criar "painéis de controlo" personalizados sobre os temas que mais interessam a cada utilizador.
-   **Entidades Envolvidas:** `SavedDataView` (já existe no `backend.json`, mas precisaria de ser implementado na UI).

## 2. Comparador de Políticas

-   **Descrição:** No "Simulador", permitir a comparação lado a lado do impacto simulado de duas ou mais políticas diferentes.
-   **Objetivo:** Oferecer uma ferramenta de análise política comparativa.
-   **Exemplo:** Comparar o impacto de "Reduzir o IRC" vs. "Aumentar o Salário Mínimo".

## 3. Notificações e Alertas

-   **Descrição:** Permitir que os utilizadores "subscrevam" indicadores ou tópicos de interesse. Quando um dado relevante for atualizado (ex: nova taxa de desemprego do INE), o utilizador receberia uma notificação (ex: por email).
-   **Objetivo:** Manter os utilizadores engajados e informados proativamente.

## 4. "O Povo Propõe" (Caixa de Sugestões Comunitária)

-   **Descrição:** Criar uma área onde os utilizadores possam submeter as suas próprias propostas de políticas. A comunidade poderia votar nas propostas.
-   **Objetivo:** Criar um canal de participação cívica e identificar temas de interesse popular.
-   **Funcionalidades Adicionais:**
    -   As propostas mais votadas poderiam ser destacadas na página principal.
    -   Poderia haver um "desafio semanal" onde a proposta mais votada é automaticamente analisada pelo simulador.
