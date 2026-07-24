import { describe, it, expect } from 'vitest';
import { SAGAS, WORLDS, getSagaByWorld } from '../worlds';
import { ALL_QUESTIONS } from '../questions';
import type { World } from '../../types/question';

describe('Sagas and Worlds Data Integrity', () => {
    it('should have 4 valid sagas defined', () => {
        expect(SAGAS).toHaveLength(4);
        SAGAS.forEach(saga => {
            expect(saga.id).toBeTruthy();
            expect(saga.title).toBeTruthy();
            expect(saga.subtitle).toBeTruthy();
            expect(saga.description).toBeTruthy();
            expect(saga.icon).toBeTruthy();
            expect(saga.color).toBeTruthy();
            expect(saga.gradient).toBeTruthy();
            expect(saga.badge).toBeTruthy();
            expect(Array.isArray(saga.worldIds)).toBe(true);
            expect(saga.worldIds.length).toBeGreaterThan(0);
        });
    });

    it('should have 18 valid worlds linked to sagas', () => {
        expect(WORLDS).toHaveLength(18);

        const sagaIds = SAGAS.map(s => s.id);

        WORLDS.forEach(world => {
            expect(world.id).toBeTruthy();
            expect(world.name).toBeTruthy();
            expect(world.description).toBeTruthy();
            expect(world.icon).toBeTruthy();
            expect(world.color).toBeTruthy();
            expect(sagaIds).toContain(world.sagaId);
        });
    });

    it('should correctly map getSagaByWorld for every world', () => {
        WORLDS.forEach(world => {
            const saga = getSagaByWorld(world.id as World);
            expect(saga).toBeDefined();
            expect(saga?.id).toBe(world.sagaId);
            expect(saga?.worldIds).toContain(world.id);
        });
    });

    it('should return undefined for invalid world in getSagaByWorld', () => {
        const saga = getSagaByWorld('non_existent_world' as World);
        expect(saga).toBeUndefined();
    });

    it('should have progressive requiredScores across unlocked worlds', () => {
        let previousScore = 0;
        WORLDS.forEach((world, index) => {
            if (index === 0) {
                expect(world.requiredScore).toBeUndefined();
            } else {
                expect(world.requiredScore).toBeDefined();
                expect(world.requiredScore!).toBeGreaterThan(previousScore);
                previousScore = world.requiredScore!;
            }
        });
    });

    it('should have questions for every world including a boss battle', () => {
        const questionWorlds = new Set(ALL_QUESTIONS.map(q => q.world));

        WORLDS.forEach(world => {
            expect(questionWorlds.has(world.id)).toBe(true);

            const worldQuestions = ALL_QUESTIONS.filter(q => q.world === world.id);
            expect(worldQuestions.length).toBeGreaterThanOrEqual(2);

            const hasBoss = worldQuestions.some(q => q.type === 'boss_battle');
            expect(hasBoss).toBe(true);

            const hasRegularQuestion = worldQuestions.some(q => q.type !== 'boss_battle');
            expect(hasRegularQuestion).toBe(true);
        });
    });
});
