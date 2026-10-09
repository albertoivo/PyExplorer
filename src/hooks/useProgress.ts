import { useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useProgressStore } from './progress/useProgressStore';
import { useProgressActions } from './progress/useProgressActions';
import { useProgressStats } from './progress/useProgressStats';

/**
 * Hook para gerenciar progresso do usuário
 */
export function useProgress() {
    const { userData, isGuest, updateUserData, refreshUserData } = useAuth();

    // 1. Store
    const {
        allProgress,
        setAllProgress,
        loading,
        error,
        setError,
        loadAllProgress,
        progressMap
    } = useProgressStore({ userData, isGuest });

    // Initial load
    useEffect(() => {
        const initializeProgress = async () => {
            await loadAllProgress();
        };
        initializeProgress();
    }, [loadAllProgress]);

    // 2. Actions (mutations)
    const { recordAttempt } = useProgressActions({
        userData,
        isGuest,
        updateUserData,
        refreshUserData,
        allProgress,
        setAllProgress,
        setError,
        loadAllProgress
    });

    // 3. Stats (getters and derived data)
    const {
        stats,
        getQuestionProgress,
        getWorldStats
    } = useProgressStats({ allProgress, progressMap });

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
