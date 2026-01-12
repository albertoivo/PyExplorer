
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    saveGamificationData,
    getGamification,
    saveProgress,
    getProgress,
    updateProgressBatch,
    getQuestion,
    getQuestions,
    getQuestionsByWorld,
    getUser,
    unlockWorld
} from '../firestore';
import {
    doc,
    setDoc,
    writeBatch,
    Timestamp
} from 'firebase/firestore';

// Mock do Firebase
vi.mock('../firebaseConfig', () => ({
    db: {},
    auth: { currentUser: { uid: 'test-user-id' } }
}));

// Mock Firestore
vi.mock('firebase/firestore', () => {
    // Mock Timestamp class
    class MockTimestamp {
        seconds: number;
        nanoseconds: number;

        constructor(seconds: number, nanoseconds: number) {
            this.seconds = seconds;
            this.nanoseconds = nanoseconds;
        }

        toDate() {
            return new Date(this.seconds * 1000);
        }

        static now() {
            return new MockTimestamp(Math.floor(Date.now() / 1000), 0);
        }

        static fromDate(date: Date) {
            return new MockTimestamp(Math.floor(date.getTime() / 1000), 0);
        }
    }

    return {
        collection: vi.fn(),
        doc: vi.fn().mockReturnValue({ id: 'mock-doc-ref' }),
        getDoc: vi.fn(),
        getDocs: vi.fn(),
        setDoc: vi.fn(),
        updateDoc: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        limit: vi.fn(),
        writeBatch: vi.fn(),
        Timestamp: MockTimestamp
    };
});

describe('Firestore Service Core Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Gamification Persistence', () => {
        const mockGamificationData = {
            level: { level: 2, currentXP: 50, totalXP: 150 },
            streak: { currentStreak: 5, longestStreak: 5, lastActivityDate: '2023-01-01', activityHistory: [] },
            achievements: [
                { achievementId: 'first_win', unlockedAt: new Date('2023-01-01'), seen: true }
            ],
            activeMissions: [
                { missionId: 'mission1', progress: 5, status: 'active', expiresAt: new Date('2023-01-02') }
            ],
            inventory: { ownedItems: [], equippedAvatar: 'default', equippedFrame: 'default', equippedTitle: 'default' },
            powerUps: { inventory: {}, usesToday: {}, lastResetDate: '2023-01-01' },
            stats: { totalQuestionsCompleted: 10, totalCorrectAnswers: 8, consecutiveCorrect: 2, bestConsecutiveCorrect: 5, weekendQuestionsCount: 0, lastWeekendDate: '', totalPlayTime: 100, worldsCompleted: 0, perfectWorlds: 0 }
        };

        it('saveGamificationData should convert Dates to Timestamps', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await saveGamificationData('user123', mockGamificationData as any);

            expect(doc).toHaveBeenCalledWith(expect.anything(), 'gamification', 'user123');

            // Check arguments of setDoc
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const setDocCalls = (setDoc as any).mock.calls;
            const dataArg = setDocCalls[0][1];

            // Verify structure
            expect(dataArg.achievements[0].unlockedAt).toBeInstanceOf(Timestamp);
            expect(dataArg.activeMissions[0].expiresAt).toBeInstanceOf(Timestamp);
        });

        it('getGamification should convert Timestamps back to Dates', async () => {
            const { getDoc } = await import('firebase/firestore');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any).mockResolvedValue({
                exists: () => true,
                data: () => ({
                    ...mockGamificationData,
                    achievements: [
                        {
                            achievementId: 'first_win',
                            unlockedAt: Timestamp.fromDate(new Date('2023-01-01'))
                        }
                    ],
                    activeMissions: [
                        {
                            missionId: 'mission1',
                            progress: 5,
                            status: 'active',
                            expiresAt: Timestamp.fromDate(new Date('2023-01-02'))
                        }
                    ]
                })
            });

            const result = await getGamification('user123');

            expect(result).not.toBeNull();
            expect(result?.achievements[0].unlockedAt).toBeInstanceOf(Date);
            expect(result?.activeMissions[0].expiresAt).toBeInstanceOf(Date);
        });

        it('getGamification should return null if document does not exist', async () => {
            const { getDoc } = await import('firebase/firestore');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any).mockResolvedValue({
                exists: () => false
            });

            const result = await getGamification('user123');
            expect(result).toBeNull();
        });
    });

    describe('Progress Tracking', () => {
        const mockProgress = {
            uid: 'user123',
            questionId: 'q1',
            status: 'completed',
            score: 100,
            attempts: 1,
            lastAttemptAt: new Date()
        };

        it('saveProgress should save progress data correctly', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await saveProgress(mockProgress as any);

            expect(doc).toHaveBeenCalledWith(expect.anything(), 'userProgress', 'user123_q1');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const setDocCalls = (setDoc as any).mock.calls;
            const dataArg = setDocCalls[0][1];

            expect(dataArg.uid).toBe('user123');
            expect(dataArg.questionId).toBe('q1');
            expect(dataArg.lastAttemptAt).toBeInstanceOf(Timestamp);
        });

        it('getProgress should retrieve and parse progress data', async () => {
            const { getDoc } = await import('firebase/firestore');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any).mockResolvedValue({
                exists: () => true,
                data: () => ({
                    ...mockProgress,
                    lastAttemptAt: Timestamp.fromDate(mockProgress.lastAttemptAt)
                })
            });

            const result = await getProgress('user123', 'q1');

            expect(result).not.toBeNull();
            expect(result?.questionId).toBe('q1');
            expect(result?.lastAttemptAt).toBeInstanceOf(Date);
        });
    });

    describe('Batch Operations', () => {
        it('updateProgressBatch should use writeBatch for atomic updates', async () => {
            const batchMock = {
                set: vi.fn(),
                update: vi.fn(),
                commit: vi.fn().mockResolvedValue(undefined)
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (writeBatch as any).mockReturnValue(batchMock);

            const { getDoc } = await import('firebase/firestore');

            // 1. First item progress (doesn't exist)
            // 2. Second item progress (doesn't exist)
            // 3. User document (exists)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any)
                .mockResolvedValueOnce({ exists: () => false })
                .mockResolvedValueOnce({ exists: () => false })
                .mockResolvedValueOnce({
                    exists: () => true,
                    data: () => ({ totalScore: 1000, displayName: 'Test', avatar: 'test' })
                });

            const items = [
                { questionId: 'q1', passed: true, score: 100 },
                { questionId: 'q2', passed: false, score: 0 }
            ];

            await updateProgressBatch('user123', items);

            expect(writeBatch).toHaveBeenCalled();

            // Should be called 3 times:
            // 1. Item 1 progress
            // 2. Item 2 progress
            // 3. Leaderboard update (batch.set)
            expect(batchMock.set).toHaveBeenCalledTimes(3);

            // User update is batch.update
            expect(batchMock.update).toHaveBeenCalledTimes(1);

            expect(batchMock.commit).toHaveBeenCalled();
        });
    });

    describe('Data Retrieval', () => {
        it('getQuestion should return question if exists', async () => {
            const { getDoc } = await import('firebase/firestore');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any).mockResolvedValue({
                exists: () => true,
                id: 'q1',
                data: () => ({ title: 'Test Question' })
            });

            const result = await getQuestion('q1');
            expect(result).not.toBeNull();
            expect(result?.id).toBe('q1');
            expect(result?.title).toBe('Test Question');
        });

        it('getQuestion should return null if not exists', async () => {
            const { getDoc } = await import('firebase/firestore');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any).mockResolvedValue({
                exists: () => false
            });

            const result = await getQuestion('q1');
            expect(result).toBeNull();
        });

        it('getQuestions should apply filters correctly', async () => {
            const { getDocs, where, orderBy, limit } = await import('firebase/firestore');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDocs as any).mockResolvedValue({
                docs: [
                    { id: 'q1', data: () => ({ title: 'Q1', difficulty: 'easy' }) }
                ]
            });

            await getQuestions({
                world: 'functions',
                difficulty: 'easy',
                limitCount: 5
            });

            expect(where).toHaveBeenCalledWith('world', '==', 'functions');
            expect(where).toHaveBeenCalledWith('difficulty', '==', 'easy');
            expect(orderBy).toHaveBeenCalledWith('difficulty');
            expect(limit).toHaveBeenCalledWith(5);
        });

        it('getQuestionsByWorld should call getQuestions with world filter', async () => {
            const { getDocs, where } = await import('firebase/firestore');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDocs as any).mockResolvedValue({ docs: [] });

            await getQuestionsByWorld('loops');

            expect(where).toHaveBeenCalledWith('world', '==', 'loops');
        });
    });

    describe('User Management', () => {
        it('getUser should parse dates correctly', async () => {
            const { getDoc, Timestamp } = await import('firebase/firestore');
            const now = new Date();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any).mockResolvedValue({
                exists: () => true,
                id: 'u1',
                data: () => ({
                    uid: 'u1',
                    createdAt: Timestamp.fromDate(now),
                    updatedAt: Timestamp.fromDate(now)
                })
            });

            const result = await getUser('u1');
            expect(result?.createdAt).toBeInstanceOf(Date);
            expect(result?.createdAt.getTime()).toBe(Math.floor(now.getTime() / 1000) * 1000); // Mock truncates ms
        });

        it('unlockWorld should add world to user data if not present', async () => {
            const { getDoc, updateDoc } = await import('firebase/firestore');
            // User exists and does NOT have the world
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any).mockResolvedValue({
                exists: () => true,
                id: 'u1',
                data: () => ({
                    unlockedWorlds: ['basic_commands']
                })
            });

            await unlockWorld('u1', 'loops');

            expect(updateDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    unlockedWorlds: ['basic_commands', 'loops']
                })
            );
        });

        it('unlockWorld should NOT update if world already unlocked', async () => {
            const { getDoc, updateDoc } = await import('firebase/firestore');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (getDoc as any).mockResolvedValue({
                exists: () => true,
                id: 'u1',
                data: () => ({
                    unlockedWorlds: ['basic_commands', 'loops']
                })
            });

            await unlockWorld('u1', 'loops');

            expect(updateDoc).not.toHaveBeenCalled();
        });
    });
});
