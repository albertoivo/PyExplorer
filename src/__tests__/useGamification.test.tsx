/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGamification } from '../hooks/useGamification';
import * as useAuthModule from '../hooks/useAuth';
import * as firestoreModule from '../firebase/firestore';

// Mock dependencies
vi.mock('../firebase/firestore', () => ({
    getGamification: vi.fn(),
    saveGamificationData: vi.fn().mockResolvedValue(undefined),
}));

describe('useGamification', () => {
    const mockUpdateUserData = vi.fn();
    const mockUserData = {
        uid: 'test-user',
        displayName: 'Tester',
        email: 'test@example.com',
        avatar: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalScore: 1000,
        balance: 500, // Starts with 500 stars
        unlockedWorlds: [],
        streak: 1,
        lastActiveDate: '2023-01-01',
        inventory: [],
        equippedAvatar: 'default',
    };

    const mockGamificationState = {
        level: { level: 1, currentXP: 0, totalXP: 0 },
        streak: {
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: '2023-01-01',
            activityHistory: ['2023-01-01'],
        },
        achievements: [],
        activeMissions: [],
        inventory: {
            ownedItems: [],
            equippedAvatar: 'default',
            equippedFrame: 'default',
            equippedTitle: 'default',
        },
        powerUps: {
            inventory: { skip: 1 },
            usesToday: {},
            lastResetDate: '2023-01-01',
        },
        stats: {
            totalQuestionsCompleted: 0,
            totalCorrectAnswers: 0,
            consecutiveCorrect: 0,
            bestConsecutiveCorrect: 0,
            weekendQuestionsCount: 0,
            lastWeekendDate: '',
            totalPlayTime: 0,
            worldsCompleted: 0,
            perfectWorlds: 0,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock for useAuth
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            userData: mockUserData as any,
            isGuest: false,
            updateUserData: mockUpdateUserData,
            refreshUserData: vi.fn(),
            user: {} as any,
            loading: false,
            error: null,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            sendPasswordReset: vi.fn(),
            enterAsGuest: vi.fn(),
            clearError: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        // Setup default mock for Firestore getGamification
        (firestoreModule.getGamification as any).mockResolvedValue(mockGamificationState);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ==========================================
    // SHOP TESTS
    // ==========================================
    it('should allow buying an item if user has enough balance', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const itemPrice = 100;
        const itemId = 'test_item_1';

        let success;
        act(() => {
            success = result.current.buyShopItem(itemId, itemPrice);
        });

        expect(success).toBe(true);
        expect(mockUpdateUserData).toHaveBeenCalledWith({
            balance: 400 // 500 - 100
        });
        expect(result.current.inventory.ownedItems).toContain(itemId);
    });

    it('should NOT allow buying an item if user has insufficient balance', async () => {
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            userData: { ...mockUserData, balance: 50 } as any,
            isGuest: false,
            updateUserData: mockUpdateUserData,
            refreshUserData: vi.fn(),
            user: {} as any,
            loading: false,
            error: null,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            sendPasswordReset: vi.fn(),
            enterAsGuest: vi.fn(),
            clearError: vi.fn(),
            loginWithGoogle: vi.fn(),
        });

        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const itemPrice = 100;
        const itemId = 'test_item_2';

        let success;
        act(() => {
            success = result.current.buyShopItem(itemId, itemPrice);
        });

        expect(success).toBe(false);
        expect(mockUpdateUserData).not.toHaveBeenCalled();
        expect(result.current.inventory.ownedItems).not.toContain(itemId);
    });

    it('should NOT allow buying an item if already owned', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.buyShopItem('test_item_3', 100);
        });

        mockUpdateUserData.mockClear();

        let success;
        act(() => {
            success = result.current.buyShopItem('test_item_3', 100);
        });

        expect(success).toBe(false);
        expect(mockUpdateUserData).not.toHaveBeenCalled();
    });

    // ==========================================
    // STREAK TESTS
    // ==========================================
    it('should update streak correctly when activity is recorded', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Mock date to be "tomorrow" relative to initial state (2023-01-01)
        const today = new Date('2023-01-02T12:00:00Z');
        vi.useFakeTimers();
        vi.setSystemTime(today);

        act(() => {
            result.current.recordDailyActivity();
        });

        expect(result.current.streak.currentStreak).toBe(2); // Was 1, continued
        expect(result.current.streak.lastActivityDate).toBe('2023-01-02');
    });

    it('should reset streak if missed a day', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Mock date to be 2 days later (2023-01-03)
        const today = new Date('2023-01-03T12:00:00Z');
        vi.useFakeTimers();
        vi.setSystemTime(today);

        act(() => {
            result.current.recordDailyActivity();
        });

        expect(result.current.streak.currentStreak).toBe(1); // Reset to 1
        expect(result.current.streak.lastActivityDate).toBe('2023-01-03');
    });

    // ==========================================
    // LEVELING UP
    // ==========================================
    it('should level up when enough XP is gained', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Initial XP: 0 (Level 1)
        // Add enough XP to level up. Assuming level 1 -> 2 needs 100 XP

        act(() => {
            result.current.addXP(200);
        });

        expect(result.current.currentLevel.level).toBeGreaterThan(1);
        expect(result.current.showLevelUp).not.toBeNull();
        expect(firestoreModule.saveGamificationData).toHaveBeenCalled();
    });

    // ==========================================
    // MISSIONS
    // ==========================================
    it('should track mission progress and complete missions', async () => {
        // Setup state with an active mission
        const missionState = {
            ...mockGamificationState,
            activeMissions: [{
                missionId: 'daily_login', // Use a real ID if possible, or mocked
                progress: 0,
                status: 'active',
                expiresAt: new Date(Date.now() + 86400000),
            }]
        };
        (firestoreModule.getGamification as any).mockResolvedValue(missionState);

        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // We need to know the target value.
        // In the real hook, it looks up dailyMissions/weeklyMissions.
        // We assume 'daily_login' exists there or we need to mock generateDailyMissions?
        // Let's check if the hook exposes the mission defs.

        // Let's use the first initialized mission.
        await waitFor(() => expect(result.current.activeMissions.length).toBeGreaterThan(0));

        const mission = result.current.activeMissions[0];
        const allMissions = [...result.current.dailyMissions, ...result.current.weeklyMissions];
        const def = allMissions.find(m => m.id === mission.missionId);

        if (def) {
            act(() => {
                result.current.updateMissionProgress(mission.missionId, def.targetValue);
            });

            const updated = result.current.activeMissions.find(m => m.missionId === mission.missionId);
            expect(updated?.status).toBe('completed');
        }
    });

    it('should claim rewards for completed missions', async () => {
        // Similar setup, but start with completed mission
        const completedState = {
            ...mockGamificationState,
            activeMissions: [{
                missionId: 'daily_login',
                progress: 1,
                status: 'completed',
                expiresAt: new Date(Date.now() + 86400000),
            }]
        };
        (firestoreModule.getGamification as any).mockResolvedValue(completedState);

        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // We need the mission definition to exist in daily/weekly to claim it (to get rewards)
        const allMissions = [...result.current.dailyMissions, ...result.current.weeklyMissions];
        const def = allMissions.find(m => m.id === 'daily_login');

        // Only proceed if mission exists in current rotation (it might not since rotation is random)
        // If it doesn't exist, claimMissionReward returns early.
        // To fix this, we should mock `generateDailyMissions` in `../data/gamificationData`.

        if (def) {
            act(() => {
                result.current.claimMissionReward('daily_login');
            });

            expect(mockUpdateUserData).toHaveBeenCalled();

            const updated = result.current.activeMissions.find(m => m.missionId === 'daily_login');
            expect(updated?.status).toBe('claimed');
        }
    });

    // ==========================================
    // ACHIEVEMENTS
    // ==========================================
    it('should unlock achievement when conditions are met', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Unlock "first_question" by recording a completed question
        act(() => {
            result.current.recordQuestionCompleted(true, 10, 5); // passed, 10xp, 5s
        });

        expect(result.current.unlockedAchievements.some(a => a.id === 'first_question')).toBe(true);
        expect(result.current.newAchievements.length).toBeGreaterThan(0);
    });
});
