import { useState, useEffect, useCallback } from 'react';
import type { UserProgress, ProgressStatus, UserAnswer, Difficulty } from '../types/question';
import { getUserProgress, updateProgress } from '../firebase/firestore';
import { useAuth } from './useAuth';
import { calculateStars, mergeStars, type StarRating } from '../utils/starCalculation';

/**
 * Hook para gerenciar progresso do usuário
 */
export function useProgress() {
    const { userData, isGuest, updateUserData, refreshUserData } = useAuth();
    const [allProgress, setAllProgress] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Chave para localStorage (modo convidado)
    const GUEST_PROGRESS_KEY = 'pyexplorer_guest_progress';

    /**
     * Carrega todo o progresso do usuário
     */
    const loadAllProgress = useCallback(async () => {
        if (!userData) {
            setAllProgress([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isGuest) {
                // Carrega do localStorage para convidados
                const stored = localStorage.getItem(GUEST_PROGRESS_KEY);
                if (stored) {
                    setAllProgress(JSON.parse(stored));
                } else {
                    setAllProgress([]);
                }
            } else {
                // Carrega do Firestore para usuários autenticados
                const data = await getUserProgress(userData.uid);
                setAllProgress(data);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar progresso';
            setError(message);
            console.error('Erro ao carregar progresso:', err);
        } finally {
            setLoading(false);
        }
    }, [userData, isGuest]);

    useEffect(() => {
        loadAllProgress();
    }, [loadAllProgress]);

    /**
     * Obtém o progresso de uma questão específica
     */
    const getQuestionProgress = useCallback((questionId: string): UserProgress | null => {
        return allProgress.find(p => p.questionId === questionId) || null;
    }, [allProgress]);

    /**
     * Atualiza o progresso de uma questão (após tentativa)
     * @param questionId - ID da questão
     * @param passed - Se acertou
     * @param score - Pontuação potencial
     * @param userAnswer - Resposta do usuário (código, índice, booleano, etc.)
     * @param difficulty - Dificuldade da questão (para cálculo de estrelas)
     * @param responseTimeSeconds - Tempo de resposta em segundos
     */
    const recordAttempt = useCallback(async (
        questionId: string,
        passed: boolean,
        score: number = 0,
        userAnswer?: UserAnswer,
        difficulty?: Difficulty,
        responseTimeSeconds?: number
    ): Promise<void> => {
        if (!userData) {
            console.warn('recordAttempt: sem userData, ignorando');
            return;
        }

        console.log('recordAttempt:', { questionId, passed, score, isGuest, userAnswer, difficulty, responseTimeSeconds });

        try {
            // Calcula o novo progresso
            const existing = allProgress.find(p => p.questionId === questionId);
            const newStatus: ProgressStatus = passed ? 'completed' : 'in_progress';
            const newAttempts = (existing?.attempts || 0) + 1;
            const newScore = passed ? Math.max(existing?.score || 0, score) : (existing?.score || 0);

            // IMPORTANTE: Se já estava completed, NÃO adiciona pontos (refazer é só prática)
            const wasAlreadyCompleted = existing?.status === 'completed';
            const additionalScore = passed && !wasAlreadyCompleted && newScore > (existing?.score || 0)
                ? newScore - (existing?.score || 0)
                : 0;

            if (wasAlreadyCompleted && passed) {
                console.log('Questão já completada anteriormente - sem pontos adicionais (modo prática)');
            }

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

                console.log('⭐ Estrelas calculadas:', { attempts: newAttempts, time: responseTimeSeconds, difficulty, earned: earnedStars, total: newStars });
            }

            const newProgress: UserProgress = {
                uid: userData.uid,
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

            // Atualização otimista da UI (imediata)
            const updatedProgress = allProgress.filter(p => p.questionId !== questionId);
            updatedProgress.push(newProgress);
            setAllProgress(updatedProgress);

            // Atualiza o score total na UI imediatamente
            if (additionalScore > 0) {
                const newTotalScore = (userData.totalScore || 0) + additionalScore;
                const newBalance = (userData.balance || 0) + additionalScore;
                console.log('Atualizando totalScore/balance:', { old: userData.totalScore, new: newTotalScore, balance: newBalance });
                await updateUserData({ totalScore: newTotalScore, balance: newBalance });
            }

            if (isGuest) {
                // Salva no localStorage para convidados
                localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(updatedProgress));
                console.log('Progresso salvo no localStorage');
            } else {
                // Salva no Firestore para usuários autenticados
                await updateProgress(userData.uid, questionId, passed, score, userAnswer, newStars, bestTime);
                console.log('Progresso salvo no Firestore');

                // Recarrega dados do usuário para garantir sincronização
                await refreshUserData();

                // Recarrega progresso do Firestore para garantir sincronização completa
                await loadAllProgress();
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao salvar progresso';
            setError(message);
            console.error('Erro ao salvar progresso:', err);
            // Em caso de erro, recarrega para ter o estado correto
            await loadAllProgress();
        }
    }, [userData, isGuest, allProgress, loadAllProgress, updateUserData, refreshUserData]);

    /**
     * Calcula estatísticas gerais do progresso
     */
    const stats = {
        totalQuestions: allProgress.length,
        completed: allProgress.filter(p => p.status === 'completed').length,
        inProgress: allProgress.filter(p => p.status === 'in_progress').length,
        totalScore: allProgress.reduce((sum, p) => sum + p.score, 0),
        totalAttempts: allProgress.reduce((sum, p) => sum + p.attempts, 0),
    };

    /**
     * Obtém progresso por mundo
     */
    const getWorldStats = useCallback((questionsByWorld: Map<string, string[]>) => {
        const worldStats: Map<string, { completed: number; total: number }> = new Map();

        for (const [world, questionIds] of questionsByWorld) {
            const completed = questionIds.filter(qId =>
                allProgress.find(p => p.questionId === qId && p.status === 'completed')
            ).length;

            worldStats.set(world, { completed, total: questionIds.length });
        }

        return worldStats;
    }, [allProgress]);

    return {
        allProgress,
        loading,
        error,
        stats,
        getQuestionProgress,
        recordAttempt,
        getWorldStats,
        reload: loadAllProgress,
    };
}

/**
 * Hook para progresso de uma questão específica
 */
export function useQuestionProgress(questionId: string | null) {
    const { allProgress, recordAttempt, loading } = useProgress();

    const progress = questionId
        ? allProgress.find(p => p.questionId === questionId) || null
        : null;

    const submitAnswer = async (passed: boolean, score: number = 0) => {
        if (!questionId) return;
        await recordAttempt(questionId, passed, score);
    };

    return {
        progress,
        loading,
        submitAnswer,
    };
}
