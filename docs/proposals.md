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

## 5. Módulo de Indicadores Municipais — Inspirado no analisa.pt

### Contexto

O site **analisa.pt** agrega 155+ indicadores sobre Portugal (qualidade de vida, criminalidade, segurança, contratos públicos, saúde, educação, etc.). Toda a informação que apresentam provém de **fontes públicas oficiais** — o que significa que **nós podemos e devemos fazer o mesmo**, indo diretamente à origem dos dados, de forma legal, gratuita e sustentável.

A vantagem para a Demokratia é enorme: em vez de depender de um site terceiro, integramos as fontes primárias, garantindo atualização contínua e evitando qualquer questão de direitos de reutilização.

---

### Fontes de Dados Mapeadas por Tema

#### 🔴 Criminalidade e Segurança

| Dado | Fonte | Acesso | URL |
|------|-------|--------|-----|
| Taxa de criminalidade por NUTS/município (por categoria de crime) | INE / DGPJ via dados.gov.pt | Download CSV/JSON + API dados.gov.pt | https://dados.gov.pt/pt/datasets/taxa-de-criminalidade-0-2/ |
| Crimes registados pelas forças de segurança | DGPJ (Direção-Geral da Política de Justiça) | Download anual | https://www.dgpj.mj.pt/pt/areas-de-atuacao/politica-legislativa-e-planeamento/estatisticas/estatisticas-da-justica/estatisticas-da-criminalidade/ |
| Relatório Anual de Segurança Interna (RASI) | MAI (Ministério da Administração Interna) | PDF/dados anuais | https://www.mai.gov.pt/index.php/pt/seguranca-interna/relatorio-anual-de-seguranca-interna |

**Acesso técnico:** Os datasets do INE em dados.gov.pt estão disponíveis via API REST do portal (`https://dados.gov.pt/api/1/`) em formato JSON, com licença aberta de reutilização.

---

#### 🟡 Qualidade de Vida — Indicadores Municipais

| Dado | Fonte | Acesso | URL |
|------|-------|--------|-----|
| Todos os indicadores municipais (saúde, educação, habitação, emprego, etc.) | PORDATA | Web (scraping permitido para uso não comercial; exportação manual CSV disponível) | https://www.pordata.pt/municipios |
| População, IDH, estrutura etária, desemprego por município | INE | API REST pública e gratuita | https://www.ine.pt/xportal/xmain?xpid=INE&xpgid=ine_api |
| Indicadores de desenvolvimento sustentável (ODS/Agenda 2030) | INE via dados.gov.pt | API dados.gov.pt | https://www.pordata.pt/ods |
| Pobreza energética, condições de habitação, atrasos em pagamentos | INE via dados.gov.pt | Dataset aberto, atualizado regularmente | https://dados.gov.pt/pt/datasets/?q=popula%C3%A7%C3%A3o+residente |

**Nota PORDATA:** Disponibiliza dados por município em temas como Justiça e Segurança, Habitação, Educação, Emprego, Saúde, Participação Eleitoral, entre outros. Tem uma API não oficial mas os dados podem ser exportados em CSV. A Fundação Francisco Manuel dos Santos (entidade gestora) permite reutilização para fins de interesse público.

---

#### 🟢 Contratos Públicos por Município

| Dado | Fonte | Acesso | URL |
|------|-------|--------|-----|
| Todos os contratos públicos de Portugal (adjudicatário, valor, entidade, tipo, localização) | Portal BASE (IMPIC) | Download gratuito em formatos abertos (CSV/XML); API em desenvolvimento (requer registo) | https://www.base.gov.pt/Base4/pt/ |
| Datasets de contratos públicos estruturados | IMPIC via dados.gov.pt | API dados.gov.pt + download | https://dados.gov.pt/pt/organizations/impic-i-p-instituto-dos-mercados-publicos-do/ |

**Acesso técnico BASE:**
- A extração de dados é **gratuita e legal** (Art. 2 do DL n.º 111-B/2017).
- Endpoint de pesquisa: `https://www.base.gov.pt/Base4/pt/resultados/?type=contracts&query=...`
- API REST não oficial já documentada por projetos open source: `https://www.base.gov.pt/Base4/rest/contratos?...` com parâmetros de filtro por município, ano, tipo, valor, etc.
- dados.gov.pt também aloja datasets CSV do BASE para download direto.

---

#### 🔵 Eleições e Participação Cívica

| Dado | Fonte | Acesso | URL |
|------|-------|--------|-----|
| Resultados eleitorais históricos por município/assembleia | CNE / SGMAI | Download CSV/JSON | https://www.cne.pt/content/resultados-eleitorais |
| Taxa de abstenção por município | PORDATA / CNE | Download | https://www.pordata.pt/municipios/elei%C3%A7%C3%B5es |

---

#### 🟠 Saúde por Município

| Dado | Fonte | Acesso | URL |
|------|-------|--------|-----|
| Taxa de mortalidade, esperança de vida, médicos por habitante | INE / DGS via dados.gov.pt | API e download | https://dados.gov.pt/pt/datasets/?q=sa%C3%BAde+munic%C3%ADpio |
| Internamentos, camas hospitalares, urgências | ACSS (Administração Central do Sistema de Saúde) | Download / Portal Transparência SNS | https://transparencia.sns.gov.pt/ |

---

#### ⚫ Ambiente e Urbanismo

| Dado | Fonte | Acesso | URL |
|------|-------|--------|-----|
| Resíduos urbanos, reciclagem por município | INE / APA via dados.gov.pt | Download CSV | https://dados.gov.pt/pt/datasets/?q=res%C3%ADduos+munic%C3%ADpio |
| Qualidade do ar por região | APA (Agência Portuguesa do Ambiente) | API REST QualAr | https://qualar.apambiente.pt/qualar/downloadAuto.PHP |

---

### API Central: dados.gov.pt

O portal **dados.gov.pt** é o ponto de acesso unificado para a maioria destas fontes, com uma **API REST pública e documentada**:

```
Base URL: https://dados.gov.pt/api/1/
Datasets: GET /datasets/?q={query}&organization={org}
Dataset específico: GET /datasets/{id}/
Download recursos: GET /datasets/{id}/resources/
```

Licença: todos os dados disponíveis em dados.gov.pt têm licença de reutilização aberta (Creative Commons ou equivalente), salvo indicação contrária.

---

### Plan de Implementação Sugerido

#### Prioridade 1 — Quick Wins (alto impacto, baixa complexidade)

1. **Contratos Públicos por Município** — usar a API/export do BASE via dados.gov.pt. Criar uma página `municipios/[id]/contratos` com filtros por ano, tipo e valor.
2. **Taxa de Criminalidade** — integrar os 4 datasets do INE disponíveis em dados.gov.pt, desagregados por NUTS e categoria de crime.

#### Prioridade 2 — Módulo Municipal Completo

3. **Dashboard Municipal** — página `municipios/[id]` com todos os indicadores (PORDATA + INE + BASE) num único painel. Comparação entre municípios.
4. **Mapa de Indicadores** — evolução do mapa existente (`src/app/(app)/map/`) com overlay de criminalidade, saúde, contratos ou outros indicadores.

#### Prioridade 3 — Funcionalidades Avançadas

5. **Alertas de Contratos** — notificar utilizadores sobre novos contratos no seu município (subscritores).
6. **Correlações** — cruzar dados de criminalidade com indicadores sociais (pobreza, desemprego) para análises de fundo.

---

### Ficheiros a Criar/Modificar

- `src/lib/system-data-sources.ts` — adicionar as novas fontes (BASE, DGPJ, dados.gov.pt, PORDATA, SNS Transparência)
- `src/app/(app)/municipios/` — nova secção municipal (ou expandir o mapa existente)
- `src/lib/api-client.ts` — adicionar funções `fetchContratosBase()`, `fetchCriminalidadeINE()`, `fetchIndicadoresMunicipio()`
- `src/lib/data.ts` — adicionar tipos e transformadores para os novos datasets

---

## 4. "O Povo Propõe" (Caixa de Sugestões Comunitária)

-   **Descrição:** Criar uma área onde os utilizadores possam submeter as suas próprias propostas de políticas. A comunidade poderia votar nas propostas.
-   **Objetivo:** Criar um canal de participação cívica e identificar temas de interesse popular.
-   **Funcionalidades Adicionais:**
    -   As propostas mais votadas poderiam ser destacadas na página principal.
    -   Poderia haver um "desafio semanal" onde a proposta mais votada é automaticamente analisada pelo simulador.
