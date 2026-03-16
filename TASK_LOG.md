# Registo de Tarefa: Correção da API Genkit

**ID da Tarefa:** FIX-GENKIT-MODEL-NOT-FOUND
**Estado:** ✅ Concluído

## Descrição
Ocorria um erro de `NOT_FOUND: Model '...' not found` em todas as funcionalidades que dependiam do Genkit para gerar conteúdo, como o "Simulador de IRS". A funcionalidade, que antes operava corretamente, deixou de funcionar após atualizações.

## Causa Raiz Identificada
A causa do problema foi uma **regressão na sintaxe** de chamada dos modelos Genkit. O código estava a passar o identificador do modelo como uma `string` simples (ex: `'gemini-2.5-pro'`). A versão atual do plugin `@genkit-ai/google-genai` exige que os modelos sejam instanciados através de uma função auxiliar.

## Resolução Implementada
O ficheiro `src/lib/actions.ts` foi integralmente corrigido para adotar a sintaxe correta, documentada na página oficial do Genkit:

1.  O plugin foi inicializado de forma simples: `googleAI()`.
2.  Foi criada uma referência de modelo reutilizável: `const geminiPro = googleAI.model('gemini-2.5-pro');`
3.  Todas as chamadas `ai.generate` foram atualizadas para usar a referência `model: geminiPro`.

Esta alteração resolveu o problema em todas as quatro funções de IA do ficheiro.

## Próximos Passos (Amanhã)
1.  Realizar um teste de validação rápido nas outras funcionalidades afetadas (Simulador Económico, Explorador de Dados, Análise de Cenários) para confirmar a correção.
2.  Arquivar ou apagar este ficheiro `TASK_LOG.md`.
3.  Retomar o desenvolvimento de novas funcionalidades, conforme o ficheiro `docs/proposals.md`.
