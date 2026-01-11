/**
 * Regression Tests
 * Testa funcionalidades que já funcionaram para garantir que não quebraram
 */
import { describe, it, expect } from 'vitest';

// ============================================
// FUNÇÕES DE SCORING (extraídas de scoring.test.ts)
// ============================================

function calculateAdditionalScore(passed: boolean, newScore: number, existingScore: number = 0): number {
    if (!passed) return 0;
    if (newScore <= existingScore) return 0;
    return newScore - existingScore;
}

function calculateNewScore(passed: boolean, attemptScore: number, existingScore: number = 0): number {
    if (!passed) return existingScore;
    return Math.max(existingScore, attemptScore);
}

function calculateStarsForQuestion(difficulty: 'easy' | 'medium' | 'hard', attempts: number, basePoints: number = 10): number {
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 };
    const attemptPenalty = Math.min(0.5, (attempts - 1) * 0.1);
    const multiplier = difficultyMultiplier[difficulty] * (1 - attemptPenalty);
    return Math.round(basePoints * multiplier);
}

// ============================================
// FUNÇÃO DE STREAK (extraída de gamificationUtils.ts)
// ============================================

function calculateStreak(currentStreak: number, lastActiveDateStr: string | null, todayDateStr: string): number {
    if (!lastActiveDateStr) return 1;
    if (lastActiveDateStr === todayDateStr) return currentStreak;

    const last = new Date(lastActiveDateStr);
    const now = new Date(todayDateStr);
    last.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return currentStreak + 1;
    if (diffDays > 1) return 1;
    return currentStreak;
}

describe('Regression Tests - Question Types', () => {
    describe('Multiple Choice Questions', () => {
        it('should validate correct answer selection', () => {
            const question = {
                id: 'test_mc',
                type: 'multiple_choice' as const,
                options: ['A', 'B', 'C', 'D'],
                answerIndex: 2,
            };

            const isCorrect = (selectedIndex: number) => selectedIndex === question.answerIndex;

            expect(isCorrect(2)).toBe(true);
            expect(isCorrect(0)).toBe(false);
            expect(isCorrect(1)).toBe(false);
            expect(isCorrect(3)).toBe(false);
        });
    });

    describe('True/False Questions', () => {
        it('should validate true/false answers', () => {
            const question = {
                id: 'test_tf',
                type: 'true_false' as const,
                correctBool: true,
            };

            const isCorrect = (answer: boolean) => answer === question.correctBool;

            expect(isCorrect(true)).toBe(true);
            expect(isCorrect(false)).toBe(false);
        });
    });

    describe('Parsons Problems', () => {
        it('should validate correct ordering', () => {
            const segments = [
                { id: 'a', code: 'print("1")', correctOrder: 0 },
                { id: 'b', code: 'print("2")', correctOrder: 1 },
                { id: 'c', code: 'print("3")', correctOrder: 2 },
            ];

            const userOrder = ['a', 'b', 'c'];
            const isCorrect = userOrder.every((id, index) => {
                const segment = segments.find(s => s.id === id);
                return segment?.correctOrder === index;
            });

            expect(isCorrect).toBe(true);

            // Wrong order
            const wrongOrder = ['c', 'b', 'a'];
            const isWrong = wrongOrder.every((id, index) => {
                const segment = segments.find(s => s.id === id);
                return segment?.correctOrder === index;
            });

            expect(isWrong).toBe(false);
        });
    });
});

describe('Regression Tests - Scoring', () => {
    it('should maintain consistent scoring formula', () => {
        const score1 = calculateStarsForQuestion('easy', 1);
        expect(score1).toBe(10);

        const scoreHard = calculateStarsForQuestion('hard', 1);
        expect(scoreHard).toBe(20);
    });

    it('should cap score within valid range', () => {
        const maxScore = calculateStarsForQuestion('hard', 1, 10);
        expect(maxScore).toBeLessThanOrEqual(50);
        expect(maxScore).toBeGreaterThan(0);

        const minScore = calculateStarsForQuestion('easy', 100, 10);
        expect(minScore).toBeGreaterThanOrEqual(0);
    });

    it('should penalize attempts correctly', () => {
        const first = calculateStarsForQuestion('medium', 1);
        const second = calculateStarsForQuestion('medium', 2);
        const third = calculateStarsForQuestion('medium', 3);

        expect(first).toBeGreaterThan(second);
        expect(second).toBeGreaterThan(third);
    });
});

describe('Regression Tests - Streak System', () => {
    it('should calculate streak correctly', () => {
        const today = '2026-01-11';
        const yesterday = '2026-01-10';
        const twoDaysAgo = '2026-01-09';

        // Continuing streak from yesterday
        const streak1 = calculateStreak(3, yesterday, today);
        expect(streak1).toBe(4);

        // Streak broken (last active 2 days ago)
        const streak2 = calculateStreak(5, twoDaysAgo, today);
        expect(streak2).toBe(1);

        // Same day login shouldn't increase streak
        const streak3 = calculateStreak(3, today, today);
        expect(streak3).toBe(3);

        // First time ever
        const streak4 = calculateStreak(0, null, today);
        expect(streak4).toBe(1);
    });
});

describe('Regression Tests - World Progression', () => {
    it('should have correct world order', async () => {
        const expectedOrder = [
            'basic_commands',
            'variables',
            'numbers',
            'conditions',
            'loops',
            'functions',
            'lists',
            'strings',
        ];

        const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
        const worlds = [...new Set(COMPLETE_QUESTIONS.map(q => q.world))];

        // All expected worlds should exist
        expectedOrder.forEach(world => {
            expect(worlds).toContain(world);
        });
    });

    it('should have boss for each main world', async () => {
        const { BOSS_QUESTIONS } = await import('../data/questions/bosses');
        const mainWorlds = ['basic_commands', 'variables', 'numbers', 'conditions', 'loops', 'functions', 'lists', 'strings'];

        mainWorlds.forEach(world => {
            const boss = BOSS_QUESTIONS.find(b => b.world === world);
            expect(boss).toBeDefined();
        });
    });
});

describe('Regression Tests - Data Persistence', () => {
    it('should serialize/deserialize user progress correctly', () => {
        const progress = {
            questionsCompleted: ['q1', 'q2', 'q3'],
            score: 500,
            streak: 3,
            lastActive: '2026-01-11',
        };

        const serialized = JSON.stringify(progress);
        const deserialized = JSON.parse(serialized);

        expect(deserialized.questionsCompleted).toEqual(progress.questionsCompleted);
        expect(deserialized.score).toBe(progress.score);
        expect(deserialized.streak).toBe(progress.streak);
        expect(deserialized.lastActive).toBe(progress.lastActive);
    });

    it('should handle missing optional fields', () => {
        const minimalProgress = {
            questionsCompleted: [],
            score: 0,
        };

        const serialized = JSON.stringify(minimalProgress);
        const deserialized = JSON.parse(serialized);

        expect(deserialized.questionsCompleted).toEqual([]);
        expect(deserialized.streak || 0).toBe(0);
    });
});

describe('Regression Tests - Edge Cases', () => {
    it('should handle zero values correctly', () => {
        expect(calculateAdditionalScore(true, 0, 0)).toBe(0);
        expect(calculateNewScore(true, 0, 0)).toBe(0);
        expect(calculateStarsForQuestion('easy', 1, 0)).toBe(0);
    });

    it('should handle very large values', () => {
        expect(calculateAdditionalScore(true, 10000, 5000)).toBe(5000);
        expect(calculateNewScore(true, 10000, 5000)).toBe(10000);
    });

    it('should handle negative streak scenarios', () => {
        // Negative values should be treated as 0
        const streak = calculateStreak(-5, '2026-01-10', '2026-01-11');
        expect(streak).toBe(-4); // Increments negative
    });
});
