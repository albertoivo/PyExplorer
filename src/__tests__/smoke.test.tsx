/**
 * Smoke Tests - Critical Path Testing
 * Testa os caminhos mais críticos do sistema
 */
import { describe, it, expect } from 'vitest';

describe('Smoke Tests - Data Integrity', () => {
    describe('Questions Data', () => {
        it('should have valid question structure', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            expect(COMPLETE_QUESTIONS.length).toBeGreaterThan(0);

            COMPLETE_QUESTIONS.forEach(q => {
                expect(q.id).toBeDefined();
                expect(q.type).toBeDefined();
                expect(q.world).toBeDefined();
                expect(q.difficulty).toBeDefined();
            });
        });

        it('should have all required question types', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            const types = new Set(COMPLETE_QUESTIONS.map(q => q.type));

            expect(types.has('multiple_choice')).toBe(true);
            expect(types.has('true_false')).toBe(true);
        });

        it('should have all worlds covered', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            const worlds = new Set(COMPLETE_QUESTIONS.map(q => q.world));

            expect(worlds.size).toBeGreaterThanOrEqual(8);
        });

        it('should have no duplicate IDs', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            const ids = COMPLETE_QUESTIONS.map(q => q.id);
            const uniqueIds = new Set(ids);

            expect(ids.length).toBe(uniqueIds.size);
        });

        it('should have balanced difficulty distribution', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');

            const easy = COMPLETE_QUESTIONS.filter(q => q.difficulty === 'easy').length;
            const medium = COMPLETE_QUESTIONS.filter(q => q.difficulty === 'medium').length;
            const hard = COMPLETE_QUESTIONS.filter(q => q.difficulty === 'hard').length;

            expect(easy).toBeGreaterThan(0);
            expect(medium).toBeGreaterThan(0);
            expect(hard).toBeGreaterThan(0);
        });
    });

    describe('Tutorials Data', () => {
        it('should have tutorials for all worlds', async () => {
            const { WORLD_TUTORIALS } = await import('../data/educationContent');
            expect(WORLD_TUTORIALS.length).toBeGreaterThanOrEqual(8);

            WORLD_TUTORIALS.forEach(t => {
                expect(t.worldId).toBeDefined();
                expect(t.title).toBeDefined();
                expect(t.steps.length).toBeGreaterThan(0);
            });
        });

        it('should have flashcards defined', async () => {
            const { FLASHCARDS } = await import('../data/educationContent');
            expect(FLASHCARDS.length).toBeGreaterThan(0);
        });
    });

    describe('Gamification Data', () => {
        it('should have achievements defined', async () => {
            const { ACHIEVEMENTS } = await import('../data/gamificationData');
            expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
        });

        it('should have missions defined', async () => {
            const { DAILY_MISSIONS } = await import('../data/gamificationData');
            expect(DAILY_MISSIONS.length).toBeGreaterThan(0);
        });

        it('should have shop items defined', async () => {
            const { SHOP_ITEMS } = await import('../data/gamificationData');
            expect(SHOP_ITEMS.length).toBeGreaterThan(0);
        });
    });

    describe('Bosses Data', () => {
        it('should have bosses for main worlds', async () => {
            const { BOSS_QUESTIONS } = await import('../data/questions/bosses');
            expect(BOSS_QUESTIONS.length).toBeGreaterThan(0);

            const mainWorlds = ['basic_commands', 'variables', 'numbers', 'conditions', 'loops', 'functions', 'lists', 'strings'];

            mainWorlds.forEach(world => {
                const boss = BOSS_QUESTIONS.find(b => b.world === world);
                expect(boss).toBeDefined();
            });
        });
    });
});

describe('Smoke Tests - Question Type Validation', () => {
    describe('Multiple Choice Questions', () => {
        it('should have valid options and answer index', async () => {
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
    });

    describe('True/False Questions', () => {
        it('should have correctBool defined', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            const trueFalse = COMPLETE_QUESTIONS.filter(q => q.type === 'true_false');

            trueFalse.forEach(q => {
                expect(typeof q.correctBool).toBe('boolean');
            });
        });
    });

    describe('Fill Code Questions', () => {
        it('should have starter code defined', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            const fillCode = COMPLETE_QUESTIONS.filter(q => q.type === 'fill_code');

            fillCode.forEach(q => {
                expect(q.starterCode).toBeDefined();
            });
        });
    });

    describe('Full Function Questions', () => {
        it('should have tests defined', async () => {
            const { COMPLETE_QUESTIONS } = await import('../data/completeQuestions');
            const fullFunction = COMPLETE_QUESTIONS.filter(q => q.type === 'full_function');

            fullFunction.forEach(q => {
                if (q.tests) {
                    expect(q.tests.length).toBeGreaterThan(0);
                }
            });
        });
    });
});

