
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    fetchAllQuestions,
    seedQuestions,
    autoSyncQuestions,
    forceSeedQuestions,
    addQuestion,
    updateQuestion
} from '../questionsService';
import {
    getDocs,
    writeBatch,
    setDoc
} from 'firebase/firestore';

// Mock dependencies
vi.mock('../firebaseConfig', () => ({
    db: {}
}));

vi.mock('../../data/completeQuestions', () => ({
    COMPLETE_QUESTIONS: [
        { id: 'q1', title: 'Q1', tests: [{ input: [1, 2], output: 3 }] },
        { id: 'q2', title: 'Q2', tests: [] }
    ]
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    writeBatch: vi.fn(),
}));

describe('questionsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchAllQuestions', () => {
        it('should return questions from firestore if available', async () => {
            (getDocs as any).mockResolvedValue({
                empty: false,
                docs: [
                    {
                        id: 'q1',
                        data: () => ({ title: 'Q1', tests: [{ inputSerialized: true, input: "[1,2]", output: 3 }] })
                    },
                    {
                        id: 'q2',
                        data: () => ({ title: 'Q2' })
                    }
                ]
            });

            const questions = await fetchAllQuestions();
            expect(questions).toHaveLength(2);
            expect(questions[0].title).toBe('Q1');
            // Check deserialization
            expect(questions[0].tests![0].input).toEqual([1, 2]);
        });

        it('should return local questions fallback if firestore is empty', async () => {
            (getDocs as any).mockResolvedValue({
                empty: true,
                docs: []
            });

            const questions = await fetchAllQuestions();
            expect(questions).toHaveLength(2); // From mock COMPLETE_QUESTIONS
        });

        it('should merge firestore questions with local questions if firestore has only partial data', async () => {
            (getDocs as any).mockResolvedValue({
                empty: false,
                docs: [
                    {
                        id: 'q1',
                        data: () => ({ title: 'Q1 from Firestore' })
                    }
                ]
            });

            const questions = await fetchAllQuestions();
            expect(questions).toHaveLength(2); // q1 from firestore + q2 from local fallback
            expect(questions.find(q => q.id === 'q1')?.title).toBe('Q1 from Firestore');
            expect(questions.find(q => q.id === 'q2')?.title).toBe('Q2');
        });

        it('should return local questions fallback if firestore fails', async () => {
            (getDocs as any).mockRejectedValue(new Error('Network error'));

            const questions = await fetchAllQuestions();
            expect(questions).toHaveLength(2);
        });
    });

    describe('autoSyncQuestions', () => {
        it('should sync questions when differences exist', async () => {
            const batchMock = {
                set: vi.fn(),
                delete: vi.fn(),
                commit: vi.fn().mockResolvedValue(undefined)
            };
            (writeBatch as any).mockReturnValue(batchMock);

            // Firestore has q1 (existing) and qOld (obsolete)
            // Local has q1 (existing) and q2 (new)
            (getDocs as any).mockResolvedValue({
                docs: [
                    { id: 'q1' },
                    { id: 'qOld' }
                ]
            });

            const result = await autoSyncQuestions();

            expect(result.synced).toBe(true);

            // Should upsert ALL local questions (q1 and q2)
            expect(batchMock.set).toHaveBeenCalledTimes(2);
            // Should delete qOld
            expect(batchMock.delete).toHaveBeenCalledTimes(1);

            expect(batchMock.commit).toHaveBeenCalledTimes(2); // One for upserts, one for deletes
        });

        it('should upsert all questions even if IDs match', async () => {
            const batchMock = {
                set: vi.fn(),
                delete: vi.fn(),
                commit: vi.fn().mockResolvedValue(undefined)
            };
            (writeBatch as any).mockReturnValue(batchMock);

            // Firestore has q1 and q2
            (getDocs as any).mockResolvedValue({
                docs: [
                    { id: 'q1' },
                    { id: 'q2' }
                ]
            });

            const result = await autoSyncQuestions();

            expect(result.synced).toBe(true);
            // Should still upsert both q1 and q2 to ensure content sync
            expect(batchMock.set).toHaveBeenCalledTimes(2);
            expect(batchMock.commit).toHaveBeenCalledTimes(1); // Only upserts, no deletes
        });
    });

    describe('helper functions', () => {
        it('seedQuestions calls autoSync', async () => {
            // Mock autoSync implicitly by mocking getDocs to return empty (needs full seed)
            const batchMock = {
                set: vi.fn(),
                delete: vi.fn(),
                commit: vi.fn().mockResolvedValue(undefined)
            };
            (writeBatch as any).mockReturnValue(batchMock);
            (getDocs as any).mockResolvedValue({ docs: [] }); // Empty

            const result = await seedQuestions();
            expect(result.success).toBe(true);
            expect(batchMock.set).toHaveBeenCalledTimes(2); // q1 and q2 added
        });

        it('forceSeedQuestions deletes all and inserts all', async () => {
            const batchMock = {
                set: vi.fn(),
                delete: vi.fn(),
                commit: vi.fn().mockResolvedValue(undefined)
            };
            (writeBatch as any).mockReturnValue(batchMock);
            (getDocs as any).mockResolvedValue({
                docs: [{ id: 'old1' }],
                size: 1
            });

            const result = await forceSeedQuestions();

            expect(result.success).toBe(true);
            // 1 delete, 2 inserts
            expect(batchMock.delete).toHaveBeenCalledTimes(1);
            expect(batchMock.set).toHaveBeenCalledTimes(2);
        });

        it('addQuestion serializes and sets doc', async () => {
            const q = { id: 'new', title: 'New', tests: [{ input: [1, 2], output: 3 }] };
            await addQuestion(q as any);

            expect(setDoc).toHaveBeenCalledWith(
                undefined, // docRef mock returns undefined
                expect.objectContaining({
                    title: 'New',
                    tests: expect.arrayContaining([
                        expect.objectContaining({
                            input: "[1,2]",
                            inputSerialized: true
                        })
                    ])
                })
            );
        });

        it('updateQuestion serializes and updates doc', async () => {
            const q = { id: 'update', title: 'Update' };
            await updateQuestion(q as any);

            expect(setDoc).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({ title: 'Update' }),
                { merge: true }
            );
        });
    });
});
