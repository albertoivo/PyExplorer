import type { Difficulty } from '../types/question';

/**
 * Rating de estrelas por questão (0 = não completou, 1-3 = completou)
 */
export type StarRating = 0 | 1 | 2 | 3;

/**
 * Limites de tempo (em segundos) para ganhar 3 estrelas por dificuldade
 */
// fallow-ignore-next-line unused-export
export const TIME_LIMITS: Record<Difficulty, number> = {
    easy: 25,
    medium: 45,
    hard: 90,
};

/**
 * Calcula quantas estrelas o jogador ganhou em uma questão
 * 
 * @param passed - Se o jogador acertou a questão
 * @param attempts - Número de tentativas (1 = primeira tentativa)
 * @param responseTimeSeconds - Tempo de resposta em segundos
 * @param difficulty - Dificuldade da questão
 * @returns 0-3 estrelas
 * 
 * Lógica:
 * - 0 estrelas: não passou
 * - 1 estrela: passou, mas com 2+ tentativas
 * - 2 estrelas: passou na 1ª tentativa, mas tempo > limite
 * - 3 estrelas: passou na 1ª tentativa E tempo <= limite
 */
export function calculateStars(
    passed: boolean,
    attempts: number,
    responseTimeSeconds: number,
    difficulty: Difficulty
): StarRating {
    if (!passed) return 0;

    const timeLimit = TIME_LIMITS[difficulty];
    const isFirstAttempt = attempts === 1;
    const isFast = responseTimeSeconds <= timeLimit;

    if (isFirstAttempt && isFast) return 3;
    if (isFirstAttempt) return 2;
    return 1;
}

/**
 * Retorna o máximo entre as estrelas atuais e as novas
 * (estrelas nunca diminuem ao refazer uma questão)
 */
export function mergeStars(current: StarRating, newStars: StarRating): StarRating {
    return Math.max(current, newStars) as StarRating;
}
