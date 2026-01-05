import type { World, Difficulty } from './question';

/**
 * Tipos para o sistema de conteúdo educacional
 */

// ============================================
// TUTORIAIS
// ============================================

/** Passo de animação do tutorial */
export interface TutorialStep {
    /** Título do passo */
    title: string;
    /** Conteúdo em linguagem infantil */
    content: string;
    /** Código de exemplo (opcional) */
    code?: string;
    /** Saída esperada do código (opcional) */
    output?: string;
    /** Exercício interativo (opcional) */
    exercise?: {
        prompt: string;
        template: string;
        answer: string;
    };
    /** Emoji/ícone do passo */
    icon: string;
    /** Animação a aplicar */
    animation?: 'fadeIn' | 'slideUp' | 'bounce' | 'typewriter';
}

/** Tutorial completo de um mundo */
export interface WorldTutorial {
    /** ID do mundo */
    worldId: World;
    /** Título do tutorial */
    title: string;
    /** Descrição geral */
    description: string;
    /** Passos do tutorial */
    steps: TutorialStep[];
    /** Tempo estimado em minutos */
    estimatedMinutes: number;
    /** Conceitos-chave abordados */
    keyConcepts: string[];
}

// ============================================
// FLASHCARDS
// ============================================

/** Flashcard de revisão */
export interface Flashcard {
    /** ID único */
    id: string;
    /** Mundo ao qual pertence */
    worldId: World;
    /** Pergunta/frente do card */
    question: string;
    /** Resposta/verso do card */
    answer: string;
    /** Exemplo de código (opcional) */
    codeExample?: string;
    /** Emoji do card */
    emoji: string;
    /** Dificuldade */
    difficulty: Difficulty;
    /** Dica extra */
    hint?: string;
}

// ============================================
// DICAS PROGRESSIVAS
// ============================================

/** Nível de dica */
export type HintLevel = 1 | 2 | 3;

/** Dica para uma questão */
export interface QuestionHint {
    /** Nível da dica (1, 2 ou 3) */
    level: HintLevel;
    /** Texto da dica */
    text: string;
    /** Custo em estrelas */
    cost: number;
}

/** Sistema de dicas de uma questão */
export interface QuestionHints {
    /** ID da questão */
    questionId: string;
    /** Array de dicas (sempre 3 níveis) */
    hints: [QuestionHint, QuestionHint, QuestionHint];
}

// ============================================
// ESTADO DO USUÁRIO
// ============================================

/** Progresso do usuário em tutoriais */
export interface UserTutorialProgress {
    /** Tutoriais completados */
    completedTutorials: World[];
    /** Passo atual em cada tutorial */
    currentStep: Record<World, number>;
    /** Timestamps */
    lastViewedAt: Record<World, Date>;
}

/** Progresso do usuário em flashcards */
export interface UserFlashcardProgress {
    /** Flashcards vistos */
    viewedCards: string[];
    /** Flashcards marcados como "sabidos" */
    knownCards: string[];
    /** Flashcards marcados para revisar */
    reviewCards: string[];
}

/** Dicas usadas pelo usuário */
export interface UserHintsUsage {
    /** Dicas já usadas por questão e nível */
    usedHints: Record<string, HintLevel[]>;
    /** Total gasto em dicas */
    totalSpent: number;
}

/** Estado completo de educação do usuário */
export interface UserEducationProgress {
    tutorials: UserTutorialProgress;
    flashcards: UserFlashcardProgress;
    hints: UserHintsUsage;
}
