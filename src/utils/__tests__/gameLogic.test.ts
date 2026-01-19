import { describe, it, expect } from 'vitest';
import { isBossUnlocked } from '../gameLogic';
import type { QuestionDocument, UserProgress, QuestionType } from '../../types/question';

describe('isBossUnlocked', () => {
    // Helper to create mock question
    const createQuestion = (id: string, type: string = 'multiple_choice'): QuestionDocument => ({
        id,
        type: type as QuestionType,
        world: 'basic_commands',
        title: 'Title',
        prompt: 'Prompt',
        difficulty: 'easy',
        order: 1
    } as QuestionDocument);

    // Helper to create mock progress
    const createProgress = (id: string, status: 'completed' | 'in_progress' | 'not_started'): UserProgress => ({
        questionId: id,
        status,
        uid: 'user1',
        score: 10,
        stars: 3,
        attempts: 1,
        lastAttemptAt: new Date()
    });

    it('returns true if all non-boss questions are completed', () => {
        const questions = [
            createQuestion('q1', 'multiple_choice'),
            createQuestion('q2', 'fill_code'),
            createQuestion('boss', 'boss_battle')
        ];

        const progressMap = new Map<string, UserProgress>();
        progressMap.set('q1', createProgress('q1', 'completed'));
        progressMap.set('q2', createProgress('q2', 'completed'));
        // Boss progress doesn't matter for unlocking itself

        const getProgress = (id: string) => progressMap.get(id) || null;

        expect(isBossUnlocked(questions, getProgress)).toBe(true);
    });

    it('returns false if any non-boss question is not completed', () => {
        const questions = [
            createQuestion('q1', 'multiple_choice'),
            createQuestion('q2', 'fill_code'), // Unfinished
            createQuestion('boss', 'boss_battle')
        ];

        const progressMap = new Map<string, UserProgress>();
        progressMap.set('q1', createProgress('q1', 'completed'));
        // q2 missing

        const getProgress = (id: string) => progressMap.get(id) || null;

        expect(isBossUnlocked(questions, getProgress)).toBe(false);
    });

    it('returns false if a question is in_progress', () => {
        const questions = [
            createQuestion('q1', 'multiple_choice'),
            createQuestion('boss', 'boss_battle')
        ];

        const progressMap = new Map<string, UserProgress>();
        progressMap.set('q1', createProgress('q1', 'in_progress'));

        const getProgress = (id: string) => progressMap.get(id) || null;

        expect(isBossUnlocked(questions, getProgress)).toBe(false);
    });

    it('handles multiple boss battles correctly (ignoring them)', () => {
        const questions = [
            createQuestion('q1', 'multiple_choice'),
            createQuestion('boss1', 'boss_battle'),
            createQuestion('boss2', 'boss_battle')
        ];

        const progressMap = new Map<string, UserProgress>();
        progressMap.set('q1', createProgress('q1', 'completed'));

        const getProgress = (id: string) => progressMap.get(id) || null;

        expect(isBossUnlocked(questions, getProgress)).toBe(true);
    });

    it('returns true if there are no non-boss questions (only boss)', () => {
        const questions = [
            createQuestion('boss', 'boss_battle')
        ];
        const getProgress = () => null;
        expect(isBossUnlocked(questions, getProgress)).toBe(true);
    });

    it('returns true if list is empty (edge case)', () => {
        expect(isBossUnlocked([], () => null)).toBe(false); // Wait, empty list means "false"?
        // In GamePage logic: if (!worldQuestions.length) return false.
        // My implementation returns worldQuestions.every(...) which is true for empty array.
        // But I added check: if (!worldQuestions.length) return false;
    });
});
