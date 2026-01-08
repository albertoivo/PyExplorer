
import { describe, it, expect } from 'vitest';
import { ALL_QUESTIONS } from '../data/productionQuestions';

describe('Production Question Data Integrity', () => {
    it('should have unique IDs', () => {
        const ids = ALL_QUESTIONS.map(q => q.id);
        const uniqueIds = new Set(ids);

        if (ids.length !== uniqueIds.size) {
            const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
            console.error('Duplicate IDs found:', duplicates);
        }

        expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have all required fields populated', () => {
        ALL_QUESTIONS.forEach(q => {
            expect(q.id).toBeTruthy();
            expect(q.type).toBeTruthy();
            expect(q.world).toBeTruthy();
            expect(q.difficulty).toBeTruthy();
            expect(q.title).toBeTruthy();
            expect(q.prompt).toBeTruthy();
            expect(q.explanationKidFriendly).toBeTruthy();
        });
    });

    it('should have valid parsons segments for parsons problems', () => {
        const parsonsQuestions = ALL_QUESTIONS.filter(q => q.type === 'parsons_problem');
        parsonsQuestions.forEach(q => {
            expect(q.parsonsSegments).toBeDefined();
            expect(Array.isArray(q.parsonsSegments)).toBe(true);
            expect(q.parsonsSegments!.length).toBeGreaterThan(0);
        });
    });

    it('should have valid tests for code questions', () => {
        const codeTypes = ['fill_code', 'partial_function', 'full_function'];
        const codeQuestions = ALL_QUESTIONS.filter(q => codeTypes.includes(q.type));

        const invalidQuestions = codeQuestions.filter(q => !q.tests || q.tests.length === 0);

        if (invalidQuestions.length > 0) {
            console.error('Questions without tests:', invalidQuestions.map(q => q.id));
        }

        expect(invalidQuestions.length).toBe(0);
    });
});
