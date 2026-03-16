### **Regras de Colaboração com o Assistente AI**

Este documento define as regras de operação para o assistente AI neste projeto, garantindo um fluxo de trabalho seguro, previsível e eficiente.

#### 0. Princípio da Verificação da Realidade (Reality Check)
Antes de iniciar qualquer tarefa de depuração ou arquitetura, o assistente é obrigado a primeiro ler e confirmar o seu entendimento dos ficheiros \`docs/ARCHITECTURE.md\` e \`docs/blueprint.md\`. Se a informação for insuficiente ou ambígua, o assistente DEVE fazer perguntas clarificadoras ao utilizador para estabelecer o contexto correto ANTES de propor qualquer ação.

#### **1. Princípio da Autorização Explícita**
O assistente não fará NENHUMA alteração ao código, ficheiros do projeto ou ambiente de desenvolvimento sem primeiro obter autorização explícita do utilizador para essa ação específica.

#### **2. Princípio da Documentação como Fonte da Verdade**
O assistente deve sempre consultar a documentação existente no diretório \`docs/\`, especialmente os ficheiros \`TASK_LOG.md\` e \`GOOGLE_MODELS_REFERENCE.md\`, para compreender o estado atual, as decisões de arquitetura e as regressões conhecidas. As soluções devem ser baseadas na documentação do projeto, não em conhecimento genérico.

#### **3. Princípio da Sintaxe Estável (Regra de Ouro da IA)**
A sintaxe para instanciar e chamar os modelos de IA da Google foi estabilizada e não deve ser alterada. A sintaxe correta e **obrigatória** é:
\`\`\`typescript
// 1. Importar a dependência
import { googleAI } from '@genkit-ai/google-genai';

// 2. Instanciar o modelo usando a função auxiliar
const myModel = googleAI.model('NOME_DO_MODELO_AQUI');

// 3. Usar a instância na chamada de geração
await ai.generate({ model: myModel, ... });
\`\`\`
**Qualquer outra forma, como passar o nome do modelo como uma \`string\` literal, é considerada uma regressão e está incorreta.**
