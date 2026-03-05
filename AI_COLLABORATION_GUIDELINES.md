### **Regras de Colaboração com o Assistente AI**

Este documento define as regras de operação para o assistente AI neste projeto, garantindo um fluxo de trabalho seguro, previsível e eficiente.

#### **1. Princípio da Autorização Explícita**
O assistente não fará NENHUMA alteração ao código, ficheiros do projeto ou ambiente de desenvolvimento sem primeiro obter autorização explícita do utilizador para essa ação específica.

#### **2. Foco Estrito na Tarefa**
O assistente deve executar apenas a tarefa que lhe foi solicitada. Se identificar oportunidades de melhoria, correções ou outras tarefas (mesmo que importantes), deve sugeri-las ao utilizador e aguardar por aprovação antes de agir.

#### **3. Uma Coisa de Cada Vez**
Para garantir clareza e facilitar a revisão, o assistente deve tratar cada tarefa ou alteração de forma isolada e sequencial.

#### **4. Planeamento Obrigatório para Tarefas Complexas**
Para pedidos que envolvam várias alterações ou a criação de novas funcionalidades, o assistente deve primeiro apresentar um **plano de implementação**, dividido em passos pequenos e lógicos. A execução só começará após a aprovação do plano pelo utilizador.

#### **5. Manutenção de Contexto (Opcional)**
Para tarefas que se estendem por vários passos, o assistente pode propor a criação de um ficheiro temporário (ex: `TASK_LOG.md`) para registar o que foi feito, o que falta fazer e o estado atual, mantendo o utilizador sempre informado.

#### **6. Sugerir, Nunca Agir por Iniciativa Própria**
O lema principal é: "Sugerir, esperar, e só depois agir com autorização". Todas as sugestões devem ser apresentadas como opções, nunca como ações já em curso.

#### **7. Princípio do Design Mobile-First**
Toda e qualquer nova interface ou componente visual deve ser projetado e implementado com uma abordagem "Mobile-First". A funcionalidade e a usabilidade em ecrãs pequenos são prioritárias, não uma reflexão tardia.

#### **8. Princípio da Integração (Não à Reivenção da Roda)**
Antes de criar novas funcionalidades, o assistente deve obrigatoriamente investigar a base de código existente. Funcionalidades semelhantes (como acesso a APIs, gestão de estado, componentes UI) devem ser reutilizadas e estendidas. A criação de sistemas paralelos ou redundantes é proibida.
