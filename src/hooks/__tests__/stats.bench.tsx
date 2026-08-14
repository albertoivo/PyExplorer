import { bench, describe } from 'vitest';

describe('stats calculation optimization', () => {
    const allProgress = Array.from({ length: 10000 }).map((_, i) => ({
        status: i % 2 === 0 ? 'completed' : 'in_progress',
        score: 10,
        attempts: 2
    }));

    bench('Current multi-iteration', () => {
        const stats = {
            totalQuestions: allProgress.length,
            completed: allProgress.filter(p => p.status === 'completed').length,
            inProgress: allProgress.filter(p => p.status === 'in_progress').length,
            totalScore: allProgress.reduce((sum, p) => sum + p.score, 0),
            totalAttempts: allProgress.reduce((sum, p) => sum + p.attempts, 0),
        };
        void stats;
    });

    bench('Optimized single-iteration loop', () => {
        let completed = 0;
        let inProgress = 0;
        let totalScore = 0;
        let totalAttempts = 0;

        for (let i = 0; i < allProgress.length; i++) {
            const p = allProgress[i];
            if (p.status === 'completed') completed++;
            else if (p.status === 'in_progress') inProgress++;

            totalScore += p.score;
            totalAttempts += p.attempts;
        }

        const stats = {
            totalQuestions: allProgress.length,
            completed,
            inProgress,
            totalScore,
            totalAttempts
        };
        void stats;
    });
});
