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
            ownedItems: ['existing_item'],
            equippedAvatar: 'default',
            equippedFrame: 'default',
            equippedTitle: 'default',
        },
        powerUps: {
            inventory: { skip: 1, fifty_fifty: 0 },
            usesToday: { skip: 0, fifty_fifty: 0 },
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

        // existing_item is in default mock state
        let success;
        act(() => {
            success = result.current.buyShopItem('existing_item', 100);
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

        act(() => {
            result.current.addXP(200);
        });

        expect(result.current.currentLevel.level).toBeGreaterThan(1);
        expect(result.current.showLevelUp).not.toBeNull();
        expect(firestoreModule.saveGamificationData).toHaveBeenCalled();
    });

    // ==========================================
    // INVENTORY / EQUIPPING
    // ==========================================
    it('should equip avatar', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.equipItem('existing_item', 'avatar');
        });

        expect(result.current.inventory.equippedAvatar).toBe('existing_item');
        expect(mockUpdateUserData).toHaveBeenCalledWith({ avatar: 'existing_item' });
    });

    it('should equip frame', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.equipItem('existing_item', 'frame');
        });

        expect(result.current.inventory.equippedFrame).toBe('existing_item');
    });

    it('should fail to equip unowned item', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.equipItem('unknown_item', 'avatar');
        });

        expect(result.current.inventory.equippedAvatar).not.toBe('unknown_item');
    });

    // ==========================================
    // POWER-UPS
    // ==========================================
    it('should use power-up successfully', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        act(() => {
            success = result.current.usePowerUp('skip');
        });

        expect(success).toBe(true);
        expect(success).toBe(true);
        expect(result.current.userPowerUps.inventory.skip).toBe(0); // Had 1
        expect(result.current.userPowerUps.usesToday.skip).toBe(1);
    });

    it('should fail to use empty power-up', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        act(() => {
            // fifty_fifty is 0 in mock
            success = result.current.usePowerUp('fifty_fifty');
        });

        expect(success).toBe(false);
    });

    it('should buy power-up if balance sufficient', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        let success;
        act(() => {
            success = result.current.buyPowerUp('skip');
        });

        expect(success).toBe(true);
        expect(success).toBe(true);
        expect(result.current.userPowerUps.inventory.skip).toBe(2); // Started with 1
    });

    // ==========================================
    // GUEST MODE
    // ==========================================
    it('should work correctly in guest mode', async () => {
        // Mock Guest Auth
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            userData: null,
            isGuest: true,
            updateUserData: vi.fn(),
            refreshUserData: vi.fn(),
            user: null,
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

        // Check initial guest state (loaded from initial or localStorage)
        expect(result.current.gamification.level.level).toBe(1);

        // Add XP
        act(() => {
            result.current.addXP(50);
        });

        expect(result.current.gamification.level.currentXP).toBe(50);
        // Should NOT call Firestore save
        expect(firestoreModule.saveGamificationData).not.toHaveBeenCalled();
    });

    // ==========================================
    // ERROR HANDLING
    // ==========================================
    it('should handle Firestore load error gracefully', async () => {
        (firestoreModule.getGamification as any).mockRejectedValue(new Error('Firestore error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Should fall back to initial state or not crash
        expect(result.current.gamification.level.level).toBeDefined();
        expect(consoleSpy).toHaveBeenCalled();
    });

    // ==========================================
    // WEEKEND LOGIC
    // ==========================================
    it('should track weekend questions correctly', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Set date to a Saturday
        const saturday = new Date('2023-01-07T12:00:00Z');
        vi.useFakeTimers();
        vi.setSystemTime(saturday);

        act(() => {
            result.current.recordQuestionCompleted(true);
        });

        // First weekend question
        expect(result.current.stats.weekendQuestionsCount).toBe(1);

        // Another one same weekend
        act(() => {
            result.current.recordQuestionCompleted(true);
        });
        expect(result.current.stats.weekendQuestionsCount).toBe(2);
    });

    // ==========================================
    // NEW ACHIEVEMENTS (BOSS, SHOP_STATS, MASTERY)
    // ==========================================
    it('should unlock boss achievements', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Giant Slayer (1 Boss)
        act(() => {
            result.current.checkBossAchievements(1, false);
        });
        expect(result.current.unlockedAchievements.some(a => a.id === 'giant_slayer')).toBe(true);

        // Legend Hunter (3 Bosses)
        act(() => {
            result.current.checkBossAchievements(3, false);
        });
        expect(result.current.unlockedAchievements.some(a => a.id === 'legend_hunter')).toBe(true);

        // Untouchable (First Try)
        act(() => {
            result.current.checkBossAchievements(1, true);
        });
        expect(result.current.unlockedAchievements.some(a => a.id === 'untouchable')).toBe(true);
    });

    it('should unlock shop collector achievements', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const mockInventory = {
            ...result.current.inventory,
            ownedItems: ['avatar_1', 'avatar_2', 'avatar_3', 'frame_1'],
        };
        const mockBalance = 1500;

        act(() => {
            result.current.checkShopAchievements(mockInventory, mockBalance);
        });

        // Fashionista (3 avatars)
        expect(result.current.unlockedAchievements.some(a => a.id === 'fashionista')).toBe(true);
        // Magnate (1000 balance)
        expect(result.current.unlockedAchievements.some(a => a.id === 'magnate')).toBe(true);
    });

    it('should unlock magnate automatically when balance is high enough (useEffect trigger)', async () => {
        // Setup user with high balance
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            userData: { ...mockUserData, balance: 2000 },
            isGuest: false,
            updateUserData: vi.fn(),
            refreshUserData: vi.fn(),
            user: { uid: 'test-uid' } as any,
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

        // Should be unlocked immediately due to useEffect
        await waitFor(() => {
            expect(result.current.unlockedAchievements.some(a => a.id === 'magnate')).toBe(true);
        });
    });

    it('should unlock mastery achievements', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const mockStats = {
            ...result.current.stats,
            totalQuestionsCompleted: 300,
            perfectWorlds: 3,
        };

        act(() => {
            result.current.checkMasteryAchievements(mockStats, 'world_5', 5);
        });

        // Living Encyclopedia (250 questions)
        expect(result.current.unlockedAchievements.some(a => a.id === 'living_encyclopedia')).toBe(true);
        // Supreme Perfectionist (3 perfect worlds)
        expect(result.current.unlockedAchievements.some(a => a.id === 'supreme_perfectionist')).toBe(true);
        // Light Speed (5 consecutive speed)
        expect(result.current.unlockedAchievements.some(a => a.id === 'light_speed')).toBe(true);
        // Python Polyglot (Last World)
        expect(result.current.unlockedAchievements.some(a => a.id === 'python_polyglot')).toBe(true);
    });
});
