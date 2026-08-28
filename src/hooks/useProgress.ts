import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserProgress, UserAnswer, Difficulty } from '../types/question';
import { getUserProgress, updateProgress } from '../firebase/firestore';
import { useAuth } from './useAuth';
import { calculateAttemptResult, calculateProgressStats, calculateWorldStats } from '../utils/progressLogic';

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
        // Se não tem usuário e não é convidado, não carrega nada
        if (!userData && !isGuest) {
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
                if (userData) {
                    const data = await getUserProgress(userData.uid);
                    setAllProgress(data);
                }
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
        const initializeProgress = async () => {
            await loadAllProgress();
        };
        initializeProgress();
    }, [loadAllProgress]);

    /**
     * Optimization: Map for O(1) access to progress by ID.
     * Replaces O(N) linear search that occurred inside render loops.
     */
    const progressMap = useMemo(() => {
        return new Map(allProgress.map(p => [p.questionId, p]));
    }, [allProgress]);

    /**
     * Obtém o progresso de uma questão específica
     */
    const getQuestionProgress = useCallback((questionId: string): UserProgress | null => {
        return progressMap.get(questionId) || null;
    }, [progressMap]);

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
        if (!userData && !isGuest) {
            return;
        }

        try {
            const existing = allProgress.find(p => p.questionId === questionId);
            const { newProgress, additionalScore } = calculateAttemptResult(
                userData?.uid || 'guest',
                questionId,
                existing,
                passed,
                score,
                userAnswer,
                difficulty,
                responseTimeSeconds
            );

            // Atualização otimista da UI (imediata)
            const updatedProgress = allProgress.filter(p => p.questionId !== questionId);
            updatedProgress.push(newProgress);
            setAllProgress(updatedProgress);

            // Atualiza o score total na UI imediatamente
            // Só atualiza score se tiver usuário
            if (additionalScore > 0 && userData) {
                const newTotalScore = (userData.totalScore || 0) + additionalScore;
                const newBalance = (userData.balance || 0) + additionalScore;
                await updateUserData({ totalScore: newTotalScore, balance: newBalance });
            }

            if (isGuest) {
                // Salva no localStorage para convidados
                localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(updatedProgress));
            } else {
                if (userData) {
                    // Salva no Firestore para usuários autenticados
                    await updateProgress(userData.uid, questionId, passed, score, userAnswer, newProgress.stars, newProgress.bestTimeSeconds);

                    // Recarrega dados do usuário para garantir sincronização
                    await refreshUserData();

                    // Recarrega progresso do Firestore para garantir sincronização completa
                    await loadAllProgress();
                }
            }
        } catch (err) {
            console.error('Erro ao salvar progresso:', err);
            // Em caso de erro, recarrega para ter o estado correto
            await loadAllProgress();

            // Define o erro DEPOIS de recarregar (pois loadAllProgress limpa o erro)
            const message = err instanceof Error ? err.message : 'Erro ao salvar progresso';
            setError(message);
        }
    }, [userData, isGuest, allProgress, loadAllProgress, updateUserData, refreshUserData]);

    /**
     * Calcula estatísticas gerais do progresso
     * Optimization: Memoized to prevent recalculation on every render
     * and uses a single loop instead of multiple array traversals.
     */
    const stats = useMemo(() => calculateProgressStats(allProgress), [allProgress]);

    /**
     * Obtém progresso por mundo
     * Optimization: Uses progressMap for O(1) lookup instead of O(N) array search inside loop
     */
    const getWorldStats = useCallback((questionsByWorld: Map<string, string[]>) => {
        return calculateWorldStats(questionsByWorld, progressMap);
    }, [progressMap]);

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
// fallow-ignore-next-line unused-export
export function useQuestionProgress(questionId: string | null) {
    const { recordAttempt, loading, getQuestionProgress } = useProgress();

    // Optimization: Use getQuestionProgress (O(1) Map lookup) instead of array.find (O(N))
    const progress = useMemo(() =>
        questionId ? getQuestionProgress(questionId) : null,
        [questionId, getQuestionProgress]
    );

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
