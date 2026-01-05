# GEMINI.md

## Visão geral do projeto

Quero criar um jogo educativo em **ReactJS** para ensinar **Python** para crianças.  
O jogo será 100% front‑end (SPA React criada com Vite), usando:

- **Pyodide** para executar código Python no navegador via WebAssembly.  
- **Firebase** para:
  - Hospedagem (Firebase Hosting).
  - Autenticação de usuários (Firebase Authentication).
  - Armazenamento de dados (Firestore) — perguntas e progresso do jogador.

A **IA (Antigravity / Gemini)** será usada apenas como auxiliar de desenvolvimento (gerar código, refatorar, criar testes, etc.).  
O jogo em produção **NÃO** deve usar IA para criar perguntas nem corrigir respostas; tudo deve ser determinístico e baseado em uma base de dados de perguntas e testes pré‑definidos.

## Público-alvo

- Crianças, aproximadamente de 8 a 15 anos.  
- Linguagem simples, exemplos lúdicos e visuais.  
- Mecânica de jogo com temas divertidos (mundos, estrelas, avatares) em vez de interface “séria” de IDE.

## Requisitos funcionais

### 1. Tipos de questões

O jogo deve suportar, no mínimo, estes tipos de questão:

1. `multiple_choice`  
   - Enunciado + lista de alternativas.  
   - Uma alternativa correta.

2. `true_false`  
   - Enunciado simples.  
   - Resposta booleana (verdadeiro/falso).

3. `fill_code` (completar código)  
   - Um trecho de código Python com lacunas.  
   - A criança completa partes específicas (ex: `range(___)`).  

4. `partial_function` (escrever parte de uma função)  
   - Função parcialmente implementada.
   - A criança completa um bloco interno específico.

5. `full_function` (escrever função inteira)  
   - Assinatura da função + problema descrito em linguagem infantil.
   - A criança escreve a implementação completa.

Cada questão tem:

- Dificuldade: `easy`, `medium` ou `hard`.  
- “Mundo”/tema (ex.: comandos básicos, decisões, repetições, funções, listas etc.).  
- Explicação amigável (`explanationKidFriendly`), em linguagem acessível às crianças.

### 2. Execução de Python com Pyodide

- Integrar **Pyodide** para rodar código Python diretamente no navegador, sem backend próprio.  
- Carregar Pyodide **uma única vez** na aplicação (por exemplo, via `PyodideProvider` + React Context).  
- Disponibilizar um hook, por exemplo `usePyodide()`, que exponha:

  - Estado `ready` (booleano).  
  - Uma função `runPython(code: string, tests?: TestCase[])` que:  
    - Executa o código do usuário.  
    - Opcionalmente roda casos de teste definidos na questão (para funções).  
    - Devolve um objeto com:
      - `stdout` (saída de `print`).  
      - `stderr` ou mensagem de erro.  
      - Resultado dos testes (passou/falhou por caso).

- **Importante**:  
  - A lógica de correção deve ser puramente baseada em testes e comparação de respostas, sem uso de IA.  
  - Para questões de função, as entradas e saídas esperadas vão estar definidas na base de dados da questão.

### 3. Banco de perguntas (sem IA em runtime)

- Todas as perguntas e respectivas respostas/casos de teste devem estar armazenadas em **Firestore**.  
- O jogo **não** deve gerar perguntas com IA em tempo de execução.  
- Schema sugerido para a coleção `questions`:

```ts
type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_code"
  | "partial_function"
  | "full_function";

type TestCase = {
  input: any;             // pode ser array, número, string, etc.
  expectedOutput: any;
};

type QuestionDocument = {
  id: string;              // Firestore ID ou campo próprio
  type: QuestionType;
  world: string;           // ex.: "basic_commands", "loops", "functions"
  difficulty: "easy" | "medium" | "hard";
  ageMin: number;
  ageMax?: number;

  title: string;
  prompt: string;          // enunciado, em linguagem infantil

  // Para múltipla escolha
  options?: string[];
  answerIndex?: number;

  // Para verdadeiro/falso
  correctBool?: boolean;

  // Para questões com código
  starterCode?: string;        // código inicial exibido no editor
  solutionTemplate?: string;   // usado em fill_code/partial_function
  tests?: TestCase[];          // casos de teste para Pyodide

  explanationKidFriendly: string; // explicação simples do conceito
};
```

### 4. Progresso do usuário e gamificação

- Usar Firestore para salvar progresso dos usuários autenticados.  
- Estrutura sugerida:

**Coleção `users`**  
- Documento por `uid` (Firebase Auth):
  - `displayName` (apelido da criança).  
  - `avatar` (string ou URL).  
  - `createdAt`, `updatedAt`.

**Coleção `userProgress`** (ou subcoleção `progress` dentro de `users`)  
- Campos:
  - `uid` (referência ao usuário).  
  - `questionId`.  
  - `status`: `"not_started" | "in_progress" | "completed"`.  
  - `score`: número de pontos/estrelas ganhos na questão.  
  - `attempts`: número de tentativas.  
  - `lastAttemptAt`: timestamp.

Mecânicas de gamificação:

- Pontos / estrelas por questão.  
- Desbloqueio de níveis/mundos baseado em progresso.  
- Recompensas visuais: ícones, avatares, pequenos badges.

### 5. Firebase

#### 5.1 Hosting

- O projeto foi criado com **Vite + React**.  
- Configurar **Firebase Hosting** para servir o build do Vite:
  - Pasta de saída: `dist` (padrão do Vite).  
  - `firebase.json` com rewrites adequados para SPA.  

#### 5.2 Authentication

- Usar **Firebase Authentication** com o SDK Web.  
- Criar um `AuthProvider` em React que encapsule:
  - `createUserWithEmailAndPassword`.  
  - `signInWithEmailAndPassword`.  
  - `onAuthStateChanged`.  
  - Função para logout.  

- Requisitos de UX para crianças:
  - Interface de login simples e visual.  
  - Possibilidade de modo “convidado” (sem login) que não salva progresso remoto, apenas localStorage.  
  - Opcional: vincular contas de crianças a um email de responsável.

#### 5.3 Firestore

- Usar Firestore para:
  - Armazenar `questions`.  
  - Armazenar `users` e `userProgress`.  
- Criar camadas de serviço no front (ex.: `questionService`, `progressService`) para isolar chamadas ao Firestore.

## Requisitos de arquitetura em React

- O projeto já existe (Vite + React) e está vazio.  
- Objetivo: estruturar o app como uma SPA com a seguinte organização sugerida:

```text
src/
  main.tsx
  App.tsx

  firebase/
    firebaseConfig.ts      // inicialização Firebase
    auth.ts                // helpers de autenticação
    firestore.ts           // helpers para Firestore

  context/
    AuthContext.tsx
    PyodideContext.tsx

  hooks/
    useAuth.ts
    usePyodide.ts
    useQuestions.ts
    useProgress.ts

  components/
    layout/
      Header.tsx
      Footer.tsx
      ProtectedRoute.tsx

    game/
      GameRouter.tsx       // decide qual mundo/tela mostrar
      WorldMap.tsx         // mapa de mundos
      QuestionEngine.tsx   // recebe uma Question e renderiza o tipo certo
      QuestionCard.tsx

      questionTypes/
        MultipleChoiceQuestion.tsx
        TrueFalseQuestion.tsx
        FillCodeQuestion.tsx
        PartialFunctionQuestion.tsx
        FullFunctionQuestion.tsx

      feedback/
        ResultPanel.tsx
        ProgressBar.tsx

    editor/
      PythonEditor.tsx     // baseado em Monaco/CodeMirror

  pages/
    HomePage.tsx
    LoginPage.tsx
    RegisterPage.tsx
    GamePage.tsx
    ProfilePage.tsx
```

- O `QuestionEngine` deve:
  - Receber uma `QuestionDocument`.  
  - Renderizar o componente apropriado conforme `type`.  
  - Coordenar:
    - Coleta de resposta.  
    - Chamada a `runPython` (quando necessário).  
    - Avaliação da resposta.  
    - Atualização de progresso no Firestore.  

- O `PythonEditor` deve:
  - Suportar destaque de sintaxe Python.  
  - Receber `starterCode`.  
  - Emitir `onChange(code: string)`.

## Uso da IA (Antigravity/Gemini) — instruções importantes

- A IA deve ser usada **apenas** para auxiliar no desenvolvimento (gerar componentes, hooks, serviços, testes, etc.).  
- O código final **não** deve depender de IA em runtime para:
  - Gerar perguntas.  
  - Corrigir respostas.  
  - Dar feedback ao usuário.  

- O conteúdo pedagógico (perguntas, respostas, explicações) deve estar sempre:
  - Em arquivos estáticos (para import inicial) **ou**  
  - Em documentos no Firestore, carregados pelo app.  

- Sempre que for gerar código, seguir boas práticas:
  - Componentes funcionais com hooks.  
  - TypeScript quando possível (pode adaptar o projeto para TS se ainda não estiver).  
  - Separar lógica de UI em hooks/serviços.  
  - Evitar lógica de Firestore diretamente dentro dos componentes de UI.

## Primeiro conjunto de tarefas para o agente

1. Configurar Firebase no projeto:
   - Criar `firebaseConfig.ts`, `auth.ts` e `firestore.ts`.  
   - Implementar `AuthContext` e `useAuth`.  

2. Implementar `PyodideContext` + `usePyodide`:
   - Carregar Pyodide uma vez.  
   - Expor `ready` + `runPython(code, tests?)`.  

3. Criar o modelo TypeScript `QuestionDocument` e `TestCase`.  

4. Criar um protótipo de `QuestionEngine` com suporte a:
   - `multiple_choice`  
   - `true_false`  
   usando dados mockados (array local) para teste.

5. Implementar `PythonEditor` e o fluxo básico de:
   - Mostrar editor para uma questão de `full_function`.  
   - Chamar `runPython` com o código do usuário e alguns testes fixos.  
   - Mostrar feedback no `ResultPanel`.

Depois disso, podemos iterar para:

- Integrar Firestore de verdade para `questions` e `userProgress`.  
- Refinar UI/UX para crianças.  
- Adicionar mais tipos de questões e mundos.
