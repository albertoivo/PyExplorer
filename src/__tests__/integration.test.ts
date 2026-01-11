/**
 * Integration Tests - System Integration
 * Testa a integração entre componentes e serviços
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

describe('Integration Tests - Scoring System', () => {
    describe('Score Calculation Flow', () => {
        it('should calculate score correctly for easy questions', () => {
            const score = calculateStarsForQuestion('easy', 1, 10);
            expect(score).toBe(10);
        });

        it('should give more points for harder difficulties', () => {
            const easy = calculateStarsForQuestion('easy', 1, 10);
            const medium = calculateStarsForQuestion('medium', 1, 10);
            const hard = calculateStarsForQuestion('hard', 1, 10);

            expect(medium).toBeGreaterThan(easy);
            expect(hard).toBeGreaterThan(medium);
        });

        it('should penalize multiple attempts', () => {
            const score1 = calculateStarsForQuestion('medium', 1, 10);
            const score2 = calculateStarsForQuestion('medium', 3, 10);

            expect(score1).toBeGreaterThan(score2);
        });

        it('should cap penalty at 50%', () => {
            const firstAttempt = calculateStarsForQuestion('easy', 1, 10);
            const manyAttempts = calculateStarsForQuestion('easy', 100, 10);

            expect(manyAttempts).toBeGreaterThanOrEqual(firstAttempt * 0.5);
        });
    });

    describe('Score Accumulation', () => {
        it('should accumulate scores correctly', () => {
            let total = 0;
            let questionScore = 0;

            // First attempt: pass with 10
            total += calculateAdditionalScore(true, 10, questionScore);
            questionScore = calculateNewScore(true, 10, questionScore);
            expect(total).toBe(10);
            expect(questionScore).toBe(10);

            // Second attempt: pass with 15 (improved)
            total += calculateAdditionalScore(true, 15, questionScore);
            questionScore = calculateNewScore(true, 15, questionScore);
            expect(total).toBe(15);
            expect(questionScore).toBe(15);
        });

        it('should not add points for non-improvement', () => {
            let total = 0;
            let questionScore = 15;

            // Attempt with lower score
            total += calculateAdditionalScore(true, 12, questionScore);
            questionScore = calculateNewScore(true, 12, questionScore);

            expect(total).toBe(0);
            expect(questionScore).toBe(15); // Keeps higher
        });
    });
});

describe('Integration Tests - Question Validation', () => {
    describe('Question Data Validation', () => {
        it('should have valid IDs (no duplicates)', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            const ids = COMPLETE_QUESTIONS.map(q => q.id);
            const uniqueIds = new Set(ids);

            expect(ids.length).toBe(uniqueIds.size);
        });

        it('should have valid difficulty distribution', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');

            const easy = COMPLETE_QUESTIONS.filter(q => q.difficulty === 'easy').length;
            const medium = COMPLETE_QUESTIONS.filter(q => q.difficulty === 'medium').length;
            const hard = COMPLETE_QUESTIONS.filter(q => q.difficulty === 'hard').length;

            expect(easy).toBeGreaterThan(0);
            expect(medium).toBeGreaterThan(0);
            expect(hard).toBeGreaterThan(0);
        });

        it('should have valid options for multiple choice', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            const multipleChoice = COMPLETE_QUESTIONS.filter(q => q.type === 'multiple_choice');

            multipleChoice.forEach(q => {
                expect(q.options).toBeDefined();
                expect(q.options!.length).toBeGreaterThanOrEqual(2);
                expect(q.answerIndex).toBeDefined();
                expect(q.answerIndex).toBeGreaterThanOrEqual(0);
                expect(q.answerIndex).toBeLessThan(q.options!.length);
            });
        });

        it('should have valid tests for code questions', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            const codeQuestions = COMPLETE_QUESTIONS.filter(
                q => q.type === 'full_function' || q.type === 'partial_function'
            );

            codeQuestions.forEach(q => {
                if (q.tests && q.tests.length > 0) {
                    q.tests.forEach(test => {
                        expect(test.input).toBeDefined();
                        expect(test.expectedOutput).toBeDefined();
                    });
                }
            });
        });

        it('should have valid fill_code questions', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            const fillCode = COMPLETE_QUESTIONS.filter(q => q.type === 'fill_code');

            fillCode.forEach(q => {
                expect(q.starterCode).toBeDefined();
            });
        });
    });
});

describe('Integration Tests - Education Content', () => {
    describe('Tutorial Coverage', () => {
        it('should have tutorials for all question worlds', async () => {
            const { getTutorialByWorld } = await import('../data/educationContent');
            const mainWorlds = ['basic_commands', 'numbers', 'variables', 'conditions', 'loops', 'functions', 'lists', 'strings'];

            mainWorlds.forEach(world => {
                const tutorial = getTutorialByWorld(world);
                expect(tutorial).toBeDefined();
            });
        });

        it('should have flashcards for revision', async () => {
            const { FLASHCARDS } = await import('../data/educationContent');
            expect(FLASHCARDS.length).toBeGreaterThan(0);

            FLASHCARDS.forEach(f => {
                expect(f.question).toBeDefined();
                expect(f.answer).toBeDefined();
            });
        });
    });
});



describe('Integration Tests - Gamification', () => {
    describe('Achievement System', () => {
        it('should have unique achievement IDs', async () => {
            const { ACHIEVEMENTS } = await import('../data/gamificationData');
            const ids = ACHIEVEMENTS.map(a => a.id);
            const uniqueIds = new Set(ids);

            expect(ids.length).toBe(uniqueIds.size);
        });

        it('should have valid achievement structure', async () => {
            const { ACHIEVEMENTS } = await import('../data/gamificationData');

            ACHIEVEMENTS.forEach(a => {
                expect(a.id).toBeDefined();
                expect(a.name).toBeDefined();
                expect(a.description).toBeDefined();
                expect(a.icon).toBeDefined();
            });
        });
    });

    describe('Shop System', () => {
        it('should have valid shop items', async () => {
            const { SHOP_ITEMS } = await import('../data/gamificationData');

            SHOP_ITEMS.forEach(item => {
                expect(item.id).toBeDefined();
                expect(item.name).toBeDefined();
                expect(item.price).toBeGreaterThanOrEqual(0);
            });
        });
    });
});
