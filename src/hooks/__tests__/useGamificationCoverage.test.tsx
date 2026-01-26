/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGamification } from '../useGamification';
import { useAuth } from '../useAuth';
import { saveGamificationData, getGamification } from '../../firebase/firestore';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { UserData } from '../../types/question';

// Hoist the mock function
const { mockGenerateDaily } = vi.hoisted(() => {
    return { mockGenerateDaily: vi.fn().mockReturnValue([]) };
});

// Mock dependencies
vi.mock('../useAuth');
vi.mock('../../firebase/firestore');
vi.mock('../../data/gamificationData', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../data/gamificationData')>();
    return {
        ...actual,
        generateDailyMissions: mockGenerateDaily,
    };
});

// Helper for mock data
const getFullMockData = (overrides: any = {}) => ({
    level: { level: 1, currentXP: 0, totalXP: 0 },
    streak: { currentStreak: 5, longestStreak: 10, lastActivityDate: '', activityHistory: [] },
    achievements: [],
    activeMissions: [],
    inventory: {
        ownedItems: ['item1'],
        equippedAvatar: 'avatar1',
        equippedFrame: 'frame1',
        equippedTitle: 'title1'
    },
    powerUps: {
        inventory: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
        usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
        lastResetDate: '2025-01-01'
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
        completedWorldIds: []
    },
    ...overrides
});

describe('useGamification Coverage Edge Cases', () => {
    const mockUser = { uid: 'test-user-coverage', displayName: 'Coverage User' };
    const mockUserData: Partial<UserData> = {
        uid: 'test-user-coverage',
        balance: 100,
    };
    const mockUpdateUserData = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockGenerateDaily.mockReturnValue([]);

        (useAuth as any).mockReturnValue({
            user: mockUser,
            userData: mockUserData,
            updateUserData: mockUpdateUserData,
            isGuest: false
        });

        (saveGamificationData as any).mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should migrate legacy streak data from UserData if present and greater than current', async () => {
        // Set date to match lastActiveDate so streak is preserved but not incremented
        // Only fake Date so setTimeout/setInterval (used by waitFor) still work
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));

        // Mock legacy user data having better streak
        (useAuth as any).mockReturnValue({
            user: mockUser,
            userData: { ...mockUserData, streak: 50, longestStreak: 100, lastActiveDate: '2025-01-01' },
            updateUserData: mockUpdateUserData,
            isGuest: false
        });

        // Mock current gamification having worse streak
        (getGamification as any).mockResolvedValue(getFullMockData({
             streak: { currentStreak: 5, longestStreak: 10, lastActivityDate: '' }
        }));

        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Expect migration to have happened
        expect(result.current.streak.currentStreak).toBe(50);
        expect(result.current.streak.longestStreak).toBe(100);
        // Expect save to be called
        expect(saveGamificationData).toHaveBeenCalledWith(
            mockUser.uid,
            expect.objectContaining({
                streak: expect.objectContaining({ currentStreak: 50 })
            })
        );
    });

    it('should unlock world_champion achievement after completing 5 worlds', async () => {
         (getGamification as any).mockResolvedValue(getFullMockData({
             stats: { worldsCompleted: 4, completedWorldIds: ['1','2','3','4'] }
        }));

        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            // Completing 5th world
            result.current.checkWorldAchievements('world-5', 10, 10, 5);
        });

        await waitFor(() => {
             expect(result.current.unlockedAchievements.some(a => a.id === 'world_champion')).toBe(true);
        });
    });

    it('should dismiss level up modal', async () => {
        (getGamification as any).mockResolvedValue(getFullMockData());
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Trigger level up
        await act(async () => {
             result.current.recordQuestionCompleted(true, 5000, 10);
        });
        expect(result.current.showLevelUp).not.toBeNull();

        // Dismiss
        await act(async () => {
            result.current.dismissLevelUp();
        });
        expect(result.current.showLevelUp).toBeNull();
    });

    it('should dismiss mission notification', async () => {
         // Setup mission completion scenario
         const today = new Date().toISOString().split('T')[0];
         const missionId = `daily_${today}_test`;
         const mockMission = {
                missionId,
                id: missionId,
                title: 'Test Mission',
                type: 'daily',
                objectiveType: 'complete_questions',
                targetValue: 1,
                target: 1,
                progress: 0,
                status: 'active',
                rewards: { stars: 50, xp: 200 },
                starsReward: 50,
                xpReward: 200,
         };
         mockGenerateDaily.mockReturnValue([mockMission]);
         (getGamification as any).mockResolvedValue(getFullMockData({ activeMissions: [] }));

         const { result } = renderHook(() => useGamification());
         await waitFor(() => expect(result.current.loading).toBe(false));

         // Trigger completion
         await act(async () => {
              result.current.recordQuestionCompleted(true, 10, 0, { starsEarned: 5 });
         });

         await waitFor(() => {
             expect(result.current.missionNotification).not.toBeNull();
         });

         // Dismiss
         await act(async () => {
             result.current.dismissMissionNotification();
         });
         expect(result.current.missionNotification).toBeNull();
    });

    it('should mark achievement as seen', async () => {
        // Setup initial state with an achievement
         (getGamification as any).mockResolvedValue(getFullMockData({
             achievements: [{ achievementId: 'first_world', unlockedAt: '2025-01-01', seen: false }]
        }));

        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            result.current.markAchievementSeen('first_world');
        });

        // Verify save
         expect(saveGamificationData).toHaveBeenCalledWith(
            mockUser.uid,
            expect.objectContaining({
                achievements: expect.arrayContaining([
                    expect.objectContaining({ achievementId: 'first_world', seen: true })
                ])
            })
        );
    });

    it('should not add duplicate achievements via safeAddAchievement', async () => {
         // Start with unlocked achievement
         (getGamification as any).mockResolvedValue(getFullMockData({
             achievements: [{ achievementId: 'first_world', unlockedAt: '2025-01-01', seen: true }]
        }));

        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Trigger action that would unlock it again
        await act(async () => {
             result.current.checkWorldAchievements('world1', 10, 10, 5);
        });

        // Should not crash and state should remain consistent
        expect(result.current.unlockedAchievements.filter(a => a.id === 'first_world').length).toBe(1);
    });
});
