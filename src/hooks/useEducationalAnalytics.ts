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
            
        console.log(`[Educational Telemetry] Error logged for ${questionId}:`, {
            errorType: normalizedError,
            count: metricsRef.current.errorCounts[normalizedError],
            fullMessage: errorMessage
        });
        
        if (metricsRef.current.errorCounts[normalizedError] >= 3) {
            console.warn(`[Educational Telemetry] FRUSTRATION DETECTED: User hit '${normalizedError}' 3+ times.`);
        }
    }, [questionId]);

    const logSuccess = useCallback(() => {
        if (!questionId) return;
        const timeSpent = Math.round((Date.now() - metricsRef.current.startTime) / 1000);
        
        console.log(`[Educational Telemetry] Success for ${questionId}:`, {
            timeSpentSeconds: timeSpent,
            totalErrors: Object.values(metricsRef.current.errorCounts).reduce((a, b) => a + b, 0),
            errorDistribution: metricsRef.current.errorCounts
        });
    }, [questionId]);

    return { logError, logSuccess };
}
