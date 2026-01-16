import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGamification } from '../useGamification';
import * as firestore from '../../firebase/firestore';
import * as useAuthHook from '../useAuth';

// Mock dependencies
vi.mock('../useAuth');
vi.mock('../../firebase/firestore');

describe('useGamification Hook', () => {
    // Spies/Mocks
    const mockSaveGamificationData = vi.fn();
    const mockGetGamification = vi.fn();

    // Store original localStorage to restore later
    const originalLocalStorage = window.localStorage;

    // Store for localStorage mock
    let store: Record<string, string> = {};

    const localStorageMock = {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        store = {}; // Reset store

        // Apply localStorage mock
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Setup Firestore mocks
        (firestore.saveGamificationData as any) = mockSaveGamificationData;
        (firestore.getGamification as any) = mockGetGamification;

        // Ensure saveGamificationData returns a Promise
        mockSaveGamificationData.mockResolvedValue(undefined);

        // Default to guest user
        (useAuthHook.useAuth as any).mockReturnValue({
            userData: null,
            isGuest: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        // Restore original localStorage
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            writable: true
        });
    });

    it('should initialize with default values', async () => {
        const { result } = renderHook(() => useGamification());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.gamification.level.level).toBe(1);
        expect(result.current.gamification.level.currentXP).toBe(0);
    });

    it('should load data from localStorage for guest user', async () => {
        const storedData = {
            level: { level: 2, currentXP: 100, totalXP: 200 },
            stats: { totalQuestionsCompleted: 10, consecutiveCorrect: 5 },
            achievements: [],
            streak: { currentStreak: 1 },
            activeMissions: [],
            inventory: { ownedItems: [], equippedAvatar: 'default' },
            powerUps: { inventory: {}, usesToday: {} }
        };

        // Use setItem to populate the store
        localStorage.setItem('pyexplorer_guest_gamification', JSON.stringify(storedData));

        const { result } = renderHook(() => useGamification());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(localStorage.getItem).toHaveBeenCalledWith('pyexplorer_guest_gamification');
        expect(result.current.gamification.level.level).toBe(2);
        expect(result.current.gamification.stats.totalQuestionsCompleted).toBe(10);
    });

    it('should load data from Firestore for authenticated user', async () => {
        const mockUser = { uid: 'user123' };
        (useAuthHook.useAuth as any).mockReturnValue({
            userData: mockUser,
            isGuest: false,
        });

        const firestoreData = {
            level: { level: 5, currentXP: 500, totalXP: 5000 },
            stats: { totalQuestionsCompleted: 50, totalCorrectAnswers: 40 },
            achievements: [{ achievementId: 'test_ach', unlockedAt: new Date(), seen: true }],
            streak: { currentStreak: 10 },
            activeMissions: [],
            inventory: { ownedItems: [], equippedAvatar: 'default' },
            powerUps: { inventory: {}, usesToday: {} }
        };
        mockGetGamification.mockResolvedValue(firestoreData);

        const { result } = renderHook(() => useGamification());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(mockGetGamification).toHaveBeenCalledWith('user123');
        expect(result.current.gamification.level.level).toBe(5);
        expect(result.current.gamification.stats.totalQuestionsCompleted).toBe(50);
    });

    it('should record question completion and update stats (correct answer)', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.recordQuestionCompleted(true, 20);
        });

        expect(result.current.gamification.stats.totalQuestionsCompleted).toBe(1);
        expect(result.current.gamification.stats.totalCorrectAnswers).toBe(1);
        expect(result.current.gamification.level.totalXP).toBe(20);
        expect(result.current.gamification.stats.consecutiveCorrect).toBe(1);

        // Verify saving
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should record question completion and update stats (wrong answer)', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // First answer correct to set streak
        act(() => {
            result.current.recordQuestionCompleted(true, 10);
        });
        expect(result.current.gamification.stats.consecutiveCorrect).toBe(1);

        // Second answer wrong
        act(() => {
            result.current.recordQuestionCompleted(false, 0);
        });

        expect(result.current.gamification.stats.totalQuestionsCompleted).toBe(2);
        expect(result.current.gamification.stats.totalCorrectAnswers).toBe(1); // Should not increment
        expect(result.current.gamification.stats.consecutiveCorrect).toBe(0); // Should reset
    });

    it('should unlock "first_question" achievement', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Before
        expect(result.current.gamification.achievements).toHaveLength(0);

        act(() => {
            result.current.recordQuestionCompleted(true, 10);
        });

        // After: Should have unlocked 'first_question' (Total >= 1)
        expect(result.current.newAchievements.length).toBeGreaterThan(0);
        expect(result.current.newAchievements[0].id).toBe('first_question');

        const hasAchievement = result.current.gamification.achievements.some(
            a => a.achievementId === 'first_question'
        );
        expect(hasAchievement).toBe(true);
    });

    it('should not duplicate achievements', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // First unlock
        act(() => {
            result.current.recordQuestionCompleted(true, 10);
        });

        const initialAchievementsCount = result.current.gamification.achievements.length;

        // Try to unlock again
        act(() => {
            result.current.recordQuestionCompleted(true, 10);
        });

        expect(result.current.gamification.achievements.length).toBe(initialAchievementsCount);
    });

    it('should sync with Firestore when authenticated', async () => {
        const mockUser = { uid: 'user123' };
        (useAuthHook.useAuth as any).mockReturnValue({
            userData: mockUser,
            isGuest: false,
        });
        mockGetGamification.mockResolvedValue(null); // Empty start

        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.recordQuestionCompleted(true, 10);
        });

        expect(mockSaveGamificationData).toHaveBeenCalledWith('user123', expect.any(Object));
    });

    it('should handle Firestore load error gracefully', async () => {
        const mockUser = { uid: 'user123' };
        (useAuthHook.useAuth as any).mockReturnValue({
            userData: mockUser,
            isGuest: false,
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockGetGamification.mockRejectedValue(new Error('Network Error'));

        const { result } = renderHook(() => useGamification());

        await waitFor(() => expect(result.current.loading).toBe(false));

        // Should fallback to default/initial state without crashing
        expect(result.current.gamification.level.level).toBe(1);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
