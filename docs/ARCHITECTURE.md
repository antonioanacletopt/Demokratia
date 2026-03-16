# Arquitetura de Execução das Server Actions

Este documento descreve a configuração e o fluxo de execução das Server Actions do Genkit, que constituem o cérebro da aplicação.

## A Arquitetura Correta e Final do Genkit

A solução final e correta para a integração com o Genkit foi encontrada após uma longa e dolorosa série de erros e alucinações por parte do assistente de IA. Agradecimentos infinitos ao utilizador pela sua paciência e orientação.

A arquitetura correta é a seguinte:

1.  **`enableFirebaseTelemetry()`**: Importada de `@genkit-ai/firebase`, esta função é chamada primeiro para resolver problemas de autenticação, injetando o `PROJECT_ID` do Google Cloud no ambiente de execução do Firebase.

2.  **`genkit()`**: Importada do pacote principal `genkit`, esta função é usada para a configuração dos plugins. **Crucialmente, ela retorna um objeto (`ai`) que é o ponto de entrada para as operações do Genkit.**

3.  **`ai.generate()`**: Este é o método correto para executar uma chamada ao modelo de linguagem. É um método do objeto `ai` retornado por `genkit()`, e já está ligado ao registo de plugins configurado.

### Configuração Final (`src/lib/actions.ts`)

O código foi refatorado para seguir este padrão funcional, que agora está correto:

```typescript
import { genkit } from 'genkit'; 
import { googleAI } from '@genkit-ai/google-genai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';

// 1. Ativa a injeção de contexto do Firebase.
enableFirebaseTelemetry();

// 2. Configura os plugins e obtém o objeto executor `ai`.
const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1',
    }),
  ],
});

// 3. Usa o método `ai.generate()` dentro das actions.
export async function getEconomicSimulation(policy: string, lang: Language): Promise<SimulationResult> {
  const { text } = await ai.generate({
    model: 'gemini-1.5-flash',
    prompt: systemPrompt,
  });
  // ...
}
```

## Histórico de Erros e Lições Aprendidas

O caminho para esta solução foi marcado por várias falhas, que servem como um aviso:

*   **Alucinação de Plugins**: Foram inventados plugins como `firebase()` e `firebasePlugin()` que não existem.
*   **Alucinação da API de Execução (`ai.model()`)**: Foi inventada uma API de `ai.model()` que não existe, causando o erro `Property 'model' does not exist...`.
*   **Alucinação da API de Configuração (`configure`)**: Foi inventada uma função `configure()` em `@genkit-ai/core` que não existe.
*   **Uso Incorreto de `generate`**: Foi importada a função `generate` de baixo nível de `@genkit-ai/ai` que requer 2 argumentos (registo e opções), em vez de usar o método `ai.generate()` que requer apenas 1 (opções). Isto causou o erro `Expected 2 arguments, but got 1`.

A solução foi encontrada apenas graças à persistência e aos relatórios de erro precisos do utilizador.
