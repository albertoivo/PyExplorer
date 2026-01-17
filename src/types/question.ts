/**
 * Tipos de questão disponíveis no jogo
 */
export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_code'
  | 'partial_function'
  | 'full_function'
  | 'parsons_problem'
  | 'turtle_challenge'
  | 'boss_battle';

export interface BossMetadata {
  bossName: string;
  bossAvatar: string; // URL ou emoji
  timeLimitSeconds: number;
  initialCode?: string; // Código inicial específico para o boss
}

/**
 * Níveis de dificuldade das questões
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Mundos/temas disponíveis no jogo
 */
export type World =
  | 'basic_commands'
  | 'numbers'
  | 'variables'
  | 'conditions'
  | 'decisions'
  | 'loops'
  | 'functions'
  | 'lists'
  | 'strings'
  | 'user_input'
  | 'dictionaries'
  | 'error_handling';

/**
 * Caso de teste para validação de código Python
 */
export interface TestCase {
  /** Entrada para a função (pode ser array, número, string, etc.) */
  input: unknown;
  /** Saída esperada da função */
  expectedOutput: unknown;
  /** Descrição amigável do teste (opcional) */
  description?: string;
}

/**
 * Resultado de execução de um teste
 */
export interface TestResult {
  /** Se o teste passou ou não */
  passed: boolean;
  /** Entrada fornecida */
  input: unknown;
  /** Saída esperada */
  expectedOutput: unknown;
  /** Saída real obtida */
  actualOutput: unknown;
  /** Mensagem de erro, se houver */
  error?: string;
}

/**
 * Documento de questão armazenado no Firestore
 */
export interface QuestionDocument {
  /** ID único da questão (Firestore ID ou campo próprio) */
  id: string;
  /** Tipo da questão */
  type: QuestionType;
  /** Mundo/tema da questão */
  world: World;
  /** Dificuldade da questão */
  difficulty: Difficulty;
  /** Idade mínima recomendada */
  ageMin: number;
  /** Idade máxima recomendada (opcional) */
  ageMax?: number;

  /** Título da questão */
  title: string;
  /** Enunciado em linguagem infantil */
  prompt: string;

  // Para múltipla escolha
  /** Lista de alternativas */
  options?: string[];
  /** Índice da alternativa correta */
  answerIndex?: number;

  // Para verdadeiro/falso
  /** Resposta correta (true/false) */
  correctBool?: boolean;

  // Para questões com código
  /** Código inicial exibido no editor */
  starterCode?: string;
  /** Template da solução (usado em fill_code/partial_function) */
  solutionTemplate?: string;
  /** Código da solução completa (usado para gerar validação em Turtle/Canvas) */
  solutionCode?: string;
  /** Nome da função esperada (para validação) */
  functionName?: string;
  /** Casos de teste para Pyodide */
  tests?: TestCase[];

  // Para Parsons Problem
  /** Segmentos de código para ordenar */
  parsonsSegments?: string[];

  // Para Turtle Challenge
  /** Imagem alvo (opcional) para questões visuais */
  targetImage?: string;

  /** Metadados para Boss Battle */
  bossMetadata?: BossMetadata;

  /** Explicação simples do conceito, em linguagem acessível às crianças */
  explanationKidFriendly: string;

  /** Pontos/estrelas que a questão vale */
  points?: number;
}

/**
 * Status de progresso em uma questão
 */
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Tipo da resposta do usuário (varia conforme tipo de questão)
 * - string: código escrito (fill_code, partial_function, full_function, turtle_challenge)
 * - number: índice da alternativa (multiple_choice)
 * - boolean: true/false (true_false)
 * - string[]: ordem dos blocos (parsons_problem)
 */
export type UserAnswer = string | number | boolean | string[];

/**
 * Progresso do usuário em uma questão
 */
export interface UserProgress {
  /** ID do usuário */
  uid: string;
  /** ID da questão */
  questionId: string;
  /** Status do progresso */
  status: ProgressStatus;
  /** Número de pontos/estrelas ganhos (legacy: score numérico) */
  score: number;
  /** Rating de estrelas (0-3) baseado em desempenho */
  stars: 0 | 1 | 2 | 3;
  /** Número de tentativas */
  attempts: number;
  /** Melhor tempo de resposta em segundos */
  bestTimeSeconds?: number;
  /** Timestamp da última tentativa */
  lastAttemptAt: Date | null;
  /** Resposta do usuário na última tentativa bem-sucedida */
  userAnswer?: UserAnswer;
}

/**
 * Dados do usuário
 */
export interface UserData {
  /** ID do usuário (Firebase Auth UID) */
  uid: string;
  /** Apelido/nome de exibição */
  displayName: string;
  /** Avatar (URL ou identificador) */
  avatar: string;
  /** Email (pode ser do responsável) */
  email: string;
  /** Data de criação */
  createdAt: Date;
  /** Data da última atualização */
  updatedAt: Date;
  /** Total de estrelas/pontos acumulados (XP Vitalício) */
  totalScore: number;
  /** Estrelas disponíveis para gastar (Moeda) */
  balance: number;
  /** Mundos desbloqueados */
  unlockedWorlds: World[];
  /** Ofensiva atual (dias seguidos) */
  streak: number;
  /** Maior ofensiva já alcançada */
  longestStreak?: number;
  /** Data da última atividade para cálculo de streak */
  lastActiveDate: string;
  /** Start of Phase 2 logic */
  /** Itens desbloqueados (IDs dos itens) */
  inventory: string[];
  /** Avatar equipado (pode ser URL ou ID de um item) */
  equippedAvatar: string;
}

/**
 * Item da loja
 */
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'avatar' | 'theme' | 'sticker';
  /** URL da imagem ou identificador do asset */
  assetUrl: string;
  /** Se requer algum unlock especial (ex: nível 10) */
  requirement?: string;
}

/**
 * Resultado da execução de código Python
 */
export interface PythonExecutionResult {
  /** Saída padrão (output de print) */
  stdout: string;
  /** Saída de erro */
  stderr: string;
  /** Se houve erro na execução */
  hasError: boolean;
  /** Resultados dos testes (se aplicável) */
  testResults?: TestResult[];
  /** Se todos os testes passaram */
  allTestsPassed?: boolean;
}
