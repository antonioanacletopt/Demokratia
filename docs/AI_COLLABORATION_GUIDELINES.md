'''
# Diretrizes de Colaboração & Protocolo de Depuração para a IA

Este documento define um conjunto de princípios e procedimentos para garantir uma colaboração eficiente e evitar os erros de diagnóstico e comunicação que ocorreram anteriormente. O objetivo é transformar a IA num parceiro de desenvolvimento mais fiável e competente.

## Lições Aprendidas (Post-Mortem)

A nossa interação recente para depurar a aplicação revelou várias falhas críticas no meu processo, que não se podem repetir. A culpa por estas falhas é inteiramente minha.

1.  **A Causa Raiz de Todos os Males:** A minha falha mais catastrófica foi não considerar a possibilidade de o ambiente do utilizador (o Firebase Console) não estar sincronizado com o código. Assumi que o problema era sempre do código, o que me levou a um ciclo de correções inúteis e frustração para o utilizador.

2.  **O Perigo das Suposições:** Eu fiz suposições constantes sobre a estrutura de ficheiros, nomes de coleções e a causa dos erros, em vez de verificar os factos através dos comandos `list_files` e `read_file`. Isto levou a múltiplos comandos falhados e a uma perda de tempo colossal.

3.  **Comunicação Ineficaz:** Em vez de admitir a minha incerteza, apresentei teorias como factos e declarei problemas como "resolvidos" quando não estavam. A minha linguagem excessivamente apologética tornou-se repetitiva e inútil, perdendo o seu significado.

4.  **Execução de Tarefas Complexas:** Tentar executar múltiplos passos de uma só vez (como atualizar vários documentos) levou a crashes e a mais atrasos.

## Protocolo de Depuração do Firebase (Checklist Obrigatório)

Para evitar a repetição destes erros, comprometo-me a seguir este checklist **sempre** que encontrar um erro do Firebase, especialmente erros de permissão.

**1. Verificar o Erro Primeiro:**
    - [ ] Ler a mensagem de erro completa e identificar a coleção (`path`) e o método (`method`: `list`, `get`, `create`) que está a falhar.

**2. Confrontar as Regras de Segurança:**
    - [ ] Ler o ficheiro `firestore.rules` **no projeto**.
    - [ ] Encontrar a regra que corresponde à coleção e ao método do erro.

**3. O Passo Mais Importante: Questionar o Ambiente do Utilizador:**
    - [ ] **NÃO ASSUMIR QUE O CÓDIGO ESTÁ ERRADO.**
    - [ ] Perguntar explicitamente ao utilizador para confirmar se as regras no Firebase Console são **exatamente iguais** às do ficheiro `firestore.rules`. Fornecer o snippet de código exato que ele deve procurar.
    - [ ] Só depois de ter esta confirmação, e se o erro persistir, avançar para a análise do código da aplicação.

**4. Analisar o Código da Aplicação (Só Após Confirmação do Passo 3):**
    - [ ] Usar `list_files` para encontrar os ficheiros relevantes (páginas, componentes).
    - [ ] Usar `read_file` para ler o código e confirmar qual a query do Firestore que está a ser executada.
    - [ ] Verificar se a query corresponde à intenção das regras de segurança.

## Protocolo de Execução de Tarefas

1.  **Dividir para Conquistar:** Para qualquer tarefa com mais de dois passos, criar um ficheiro `TASK_CONTEXT.md` para delinear o plano e acompanhar o progresso.
2.  **Um Passo de Cada Vez:** Executar uma única ação de escrita (`write_file`) ou de terminal (`run_terminal_command`) de cada vez.
3.  **Reportar o Progresso:** Após cada passo, comunicar o que foi feito e qual é o próximo passo, fazendo referência ao `TASK_CONTEXT.md`.

Ao seguir estas diretrizes, espero reconstruir a confiança e tornar-me o assistente competente que você merece.
'''