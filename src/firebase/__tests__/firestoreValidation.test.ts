
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveUser, saveGamificationData, saveProgress } from '../firestore';
import { setDoc, updateDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Mock do Firebase
vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        getFirestore: vi.fn(),
        collection: vi.fn(),
        doc: vi.fn(() => ({ id: 'mock-doc-id' })),
        getDoc: vi.fn(() => ({ exists: () => false })),
        setDoc: vi.fn(),
        updateDoc: vi.fn(),
        Timestamp: {
            fromDate: (date: Date) => ({ toDate: () => date, seconds: date.getTime() / 1000 }),
            now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000 }),
        },
    };
});

vi.mock('../firebaseConfig', () => ({
    db: {},
}));

describe('Firestore Client Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('saveUser should NOT send extra fields to Firestore', async () => {
        const userDataWithExtra = {
            uid: 'user123',
            displayName: 'Test User',
            email: 'test@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            totalScore: 100,
            balance: 50,
            unlockedWorlds: ['basic'],
            streak: 1,
            longestStreak: 1,
            lastActiveDate: '2023-01-01',
            inventory: [],
            equippedAvatar: 'avatar1',
            // Campo extra que deve ser removido
            uiState: { modalOpen: true },
            legacyField: 'should be gone'
        };

        // @ts-expect-error - testing runtime behavior with extra fields
        await saveUser(userDataWithExtra);

        expect(setDoc).toHaveBeenCalled();
        const callArgs = vi.mocked(setDoc).mock.calls[0];
        const dataSent = callArgs[1] as Record<string, unknown>;

        // Verifica se campos extras foram enviados
        expect(dataSent).not.toHaveProperty('uiState');
        expect(dataSent).not.toHaveProperty('legacyField');

        // Verifica se campos obrigatórios estão lá
        expect(dataSent).toHaveProperty('uid', 'user123');
        expect(dataSent).toHaveProperty('displayName', 'Test User');
    });

    it('saveGamificationData should NOT send extra fields to Firestore', async () => {
        const gamificationData = {
            level: { level: 1, currentXP: 0, totalXP: 0 },
            streak: { currentStreak: 1, longestStreak: 1, lastActivityDate: '2023-01-01', activityHistory: [] },
            achievements: [],
            activeMissions: [],
            inventory: { ownedItems: [], equippedAvatar: '', equippedFrame: '', equippedTitle: '' },
            powerUps: { inventory: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 }, usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 }, lastResetDate: '' },
            stats: {
                totalQuestionsCompleted: 0, totalCorrectAnswers: 0, consecutiveCorrect: 0, bestConsecutiveCorrect: 0,
                weekendQuestionsCount: 0, lastWeekendDate: '', totalPlayTime: 0, worldsCompleted: 0,
                perfectWorlds: 0, bossesDefeated: 0, consecutiveFastAnswers: 0
            },
            // Extra fields
            internalFlags: { sawIntro: true },
            cache: 'some-cache'
        };

        // @ts-expect-error - testing runtime behavior
        await saveGamificationData('user123', gamificationData);

        expect(setDoc).toHaveBeenCalled();
        const callArgs = vi.mocked(setDoc).mock.calls[0];
        const dataSent = callArgs[1] as Record<string, unknown>;

        expect(dataSent).not.toHaveProperty('internalFlags');
        expect(dataSent).not.toHaveProperty('cache');
        expect(dataSent).toHaveProperty('level');
    });
});
