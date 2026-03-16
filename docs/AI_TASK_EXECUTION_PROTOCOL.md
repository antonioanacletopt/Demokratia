### **Protocolo de Execução de Tarefas Complexas**

Este documento define o protocolo obrigatório que o assistente AI deve seguir para executar tarefas complexas que envolvam múltiplas alterações em vários ficheiros. O objetivo é garantir transparência, controlo por parte do utilizador e um registo claro do progresso.

#### **1. Princípio da Clarificação e Planeamento**

Para qualquer tarefa que não seja trivial (i.e., que afete mais do que um ficheiro ou envolva múltiplos passos lógicos), o assistente DEVE:
a. Fazer perguntas para garantir que compreendeu perfeitamente o objetivo do utilizador.
b. Identificar todos os ficheiros e áreas do código que serão afetados.
c. Propor um plano de execução detalhado, passo a passo.

#### **2. Princípio do Contexto de Tarefa (Task Context)**

Antes de iniciar a execução do plano, o assistente DEVE criar um ficheiro temporário na raiz do projeto chamado `TASK_CONTEXT.md`. Este ficheiro servirá como a "única fonte de verdade" para o estado da tarefa e DEVE conter:
a. **Objetivo:** Uma descrição clara da tarefa.
b. **Plano:** O plano de execução passo a passo.
c. **Estado:** Uma lista de verificação (checkboxes) que será atualizada em tempo real à medida que cada passo é concluído.

#### **3. Princípio da Autorização por Etapas**

O assistente apresentará o plano inicial contido no `TASK_CONTEXT.md` ao utilizador. A execução SÓ COMEÇARÁ após la autorização explícita do utilizador. Para tarefas muito longas ou críticas, o assistente pode (e deve) pedir re-confirmação em etapas intermédias.

#### **4. Princípio do Registo de Progresso**

Após a conclusão de CADA passo do plano, o assistente DEVE obrigatoriamente atualizar o ficheiro `TASK_CONTEXT.md`, marcando o passo como concluído (`[X]`).

#### **5. Princípio da Limpeza**

Após a conclusão BEM SUCEDIDA de todos os passos do plano, o assistente DEVE apagar o ficheiro `TASK_CONTEXT.md`. O ficheiro não deve ser eliminado se a tarefa for interrompida ou falhar.

---
*Este protocolo foi estabelecido em colaboração com o utilizador para otimizar a eficiência e a segurança das operações do assistente AI.*
