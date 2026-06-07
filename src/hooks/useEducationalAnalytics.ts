import { useRef, useEffect, useCallback } from 'react';
import { categorizePythonError } from '../utils/errorTranslations';

export function useEducationalAnalytics(questionId?: string) {
    const metricsRef = useRef({
        questionId,
        startTime: 0,
        errorCounts: {} as Record<string, number>,
    });

    useEffect(() => {
        metricsRef.current = {
            questionId,
            startTime: Date.now(),
            errorCounts: {},
        };
    }, [questionId]);

    const logError = useCallback((errorMessage: string) => {
        if (!questionId) return;
        const normalizedError = categorizePythonError(errorMessage);
        
        metricsRef.current.errorCounts[normalizedError] = 
            (metricsRef.current.errorCounts[normalizedError] || 0) + 1;
    }, [questionId]);

    const logSuccess = useCallback(() => {
        if (!questionId) return;
    }, [questionId]);

    return { logError, logSuccess };
}
