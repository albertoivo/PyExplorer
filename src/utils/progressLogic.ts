import type { UserProgress, ProgressStatus, UserAnswer, Difficulty } from '../types/question';
import { calculateStars, mergeStars, type StarRating } from './starCalculation';

export function calculateAttemptResult(
    uid: string,
    questionId: string,
    existing: UserProgress | undefined,
    passed: boolean,
    score: number = 0,
    userAnswer?: UserAnswer,
    difficulty?: Difficulty,
    responseTimeSeconds?: number
): { newProgress: UserProgress; additionalScore: number } {
    const newStatus: ProgressStatus = passed ? 'completed' : 'in_progress';
    const newAttempts = (existing?.attempts || 0) + 1;
    const newScore = passed ? Math.max(existing?.score || 0, score) : (existing?.score || 0);

    // IMPORTANTE: Se já estava completed, NÃO adiciona pontos (refazer é só prática)
    const wasAlreadyCompleted = existing?.status === 'completed';
    const additionalScore = passed && !wasAlreadyCompleted && newScore > (existing?.score || 0)
        ? newScore - (existing?.score || 0)
        : 0;

    // Calcula estrelas (0-3) baseado em tentativas e tempo
    let newStars: StarRating = existing?.stars || 0;
    let bestTime = existing?.bestTimeSeconds;

    if (passed && difficulty && responseTimeSeconds !== undefined) {
        const earnedStars = calculateStars(passed, newAttempts, responseTimeSeconds, difficulty);
        newStars = mergeStars(existing?.stars || 0, earnedStars);

        // Atualiza melhor tempo se for menor
        if (!bestTime || responseTimeSeconds < bestTime) {
            bestTime = responseTimeSeconds;
        }
    }

    const newProgress: UserProgress = {
        uid,
        questionId,
        status: newStatus,
        score: newScore,
        stars: newStars,
        attempts: newAttempts,
        bestTimeSeconds: bestTime,
        lastAttemptAt: new Date(),
        // Salva a resposta do usuário apenas se passou
        userAnswer: passed && userAnswer !== undefined ? userAnswer : existing?.userAnswer,
    };

    return { newProgress, additionalScore };
}

export function calculateProgressStats(allProgress: UserProgress[]) {
    let completed = 0;
    let inProgress = 0;
    let totalScore = 0;
    let totalAttempts = 0;

    for (let i = 0; i < allProgress.length; i++) {
        const p = allProgress[i];
        if (p.status === 'completed') {
            completed++;
        } else if (p.status === 'in_progress') {
            inProgress++;
        }
        totalScore += p.score;
        totalAttempts += p.attempts;
    }

    return {
        totalQuestions: allProgress.length,
        completed,
        inProgress,
        totalScore,
        totalAttempts,
    };
}

export function calculateWorldStats(
    questionsByWorld: Map<string, string[]>,
    progressMap: Map<string, UserProgress>
) {
    const worldStats: Map<string, { completed: number; total: number }> = new Map();

    for (const [world, questionIds] of questionsByWorld) {
        const completed = questionIds.filter(qId => {
            const p = progressMap.get(qId);
            return p && p.status === 'completed';
        }).length;

        worldStats.set(world, { completed, total: questionIds.length });
    }

    return worldStats;
}
