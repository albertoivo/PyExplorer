import { useCallback, useMemo } from 'react';
import type { UserProgress } from '../../types/question';
import { calculateProgressStats, calculateWorldStats } from '../../utils/progressLogic';

interface UseProgressStatsProps {
    allProgress: UserProgress[];
    progressMap: Map<string, UserProgress>;
}

export function useProgressStats({ allProgress, progressMap }: UseProgressStatsProps) {
    /**
     * Obtém o progresso de uma questão específica
     */
    const getQuestionProgress = useCallback((questionId: string): UserProgress | null => {
        return progressMap.get(questionId) || null;
    }, [progressMap]);

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
        getQuestionProgress,
        stats,
        getWorldStats
    };
}
