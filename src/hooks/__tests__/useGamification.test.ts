/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGamification } from '../useGamification';
import { useAuth } from '../useAuth';
import { saveGamificationData, getGamification } from '../../firebase/firestore';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { UserData } from '../../types/question';

// Hoist the mock function to be accessible in vi.mock and tests
const { mockGenerateDaily } = vi.hoisted(() => {
    return { mockGenerateDaily: vi.fn().mockReturnValue([]) };
});

// Mock dependências
vi.mock('../useAuth');
vi.mock('../../firebase/firestore');
vi.mock('../../data/gamificationData', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../data/gamificationData')>();
    return {
        ...actual,
        generateDailyMissions: mockGenerateDaily,
    };
});

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
    },
    ...overrides
});

describe('useGamification Hook', () => {
    const mockUser = { uid: 'test-user-123', displayName: 'Test User' };
    const mockUserData: Partial<UserData> = {
        uid: 'test-user-123',
        balance: 100,
    };
    const mockUpdateUserData = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockGenerateDaily.mockReturnValue([]); // Reset default return

        // Configura mocks padrão
        (useAuth as any).mockReturnValue({
            user: mockUser,
            userData: mockUserData,
            updateUserData: mockUpdateUserData,
        });

        (getGamification as any).mockResolvedValue(null); // Retorna null para usar estado inicial
        (saveGamificationData as any).mockResolvedValue(undefined);
    });

    it('should initialize with default state', async () => {
        const { result } = renderHook(() => useGamification());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.currentLevel.level).toBe(1);
        expect(result.current.inventory.ownedItems.length).toBeGreaterThan(0);
        expect(result.current.streak.currentStreak).toBe(0);
        expect(result.current.streak.longestStreak).toBe(0);
    });

    describe('Question Progress (recordQuestionCompleted)', () => {
        it('should update XP and stats when a question is passed', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const initialXP = result.current.gamification.level.totalXP;

            await act(async () => {
                // recordQuestionCompleted(passed, xp, responseTime, options)
                // options calls for starsEarned to be passed there if needed.
                // Assuming defaults are fine here since tests verified logic.
                result.current.recordQuestionCompleted(true, 50, 10, { starsEarned: 5 });
            });

            expect(mockUpdateUserData).toHaveBeenCalledWith(expect.objectContaining({
                balance: 105,
                totalScore: initialXP + 50
            }));

            expect(saveGamificationData).toHaveBeenCalledWith(
                mockUser.uid,
                expect.objectContaining({
                    level: expect.objectContaining({ totalXP: initialXP + 50 }),
                    stats: expect.objectContaining({
                        totalQuestionsCompleted: 1,
                        totalCorrectAnswers: 1
                    })
                })
            );
        });

        it('should handle level up correctly', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                result.current.recordQuestionCompleted(true, 5000, 10);
            });

            expect(result.current.showLevelUp).not.toBeNull();
            expect(result.current.showLevelUp?.level).toBeGreaterThan(1);
        });

        it('should not gain XP if question failed', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                result.current.recordQuestionCompleted(false, 50, 10);
            });

            expect(saveGamificationData).toHaveBeenCalledWith(
                mockUser.uid,
                expect.objectContaining({
                    stats: expect.objectContaining({
                        totalQuestionsCompleted: 1,
                        totalCorrectAnswers: 0
                    })
                })
            );
        });
    });

    describe('Missions (claimMissionReward)', () => {
        it('should claim reward for a completed mission', async () => {
            const today = new Date().toISOString().split('T')[0];
            const missionId = `daily_${today}_0`;

            const mockMission = {
                missionId: missionId,
                id: missionId,
                title: 'Test Daily',
                type: 'daily',
                objectiveType: 'complete_questions',
                target: 3,
                targetValue: 3,
                progress: 3,
                completed: false,
                status: 'active',
                rewards: { stars: 20, xp: 100 },
                starsReward: 20,
                xpReward: 100,
                description: 'Test'
            };

            // Set Mock Return Value using hoisted mock
            mockGenerateDaily.mockReturnValue([mockMission]);

            (getGamification as any).mockResolvedValue(getFullMockData({
                activeMissions: [mockMission]
            }));

            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await waitFor(() => expect(result.current.activeMissions[0].missionId).toBe(missionId));

            await act(async () => {
                result.current.claimMissionReward(missionId);
            });

            expect(mockUpdateUserData).toHaveBeenCalled();
        });
    });

    describe('Inventory & Shop', () => {
        it('should equip an item', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                result.current.equipItem('new_avatar_id', 'avatar');
            });

            expect(result.current.gamification.inventory.equippedAvatar).toBe('new_avatar_id');
            expect(saveGamificationData).toHaveBeenCalled();
        });

        it('should buy a shop item if affordable', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const price = 50;
            let success = false;
            await act(async () => {
                success = result.current.buyShopItem('cool_hat', price);
            });

            expect(success).toBe(true);
            expect(result.current.gamification.inventory.ownedItems).toContain('cool_hat');
            expect(mockUpdateUserData).toHaveBeenCalledWith(expect.objectContaining({
                balance: 50
            }));
        });

        it('should fail to buy shop item if too expensive', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const price = 150;
            let success = false;
            await act(async () => {
                success = result.current.buyShopItem('expensive_hat', price);
            });

            expect(success).toBe(false);
            expect(result.current.gamification.inventory.ownedItems).not.toContain('expensive_hat');
        });

        it('should preserve inventory when equipItem is called after buyShopItem', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const initialOwnedCount = result.current.gamification.inventory.ownedItems.length;

            let buySuccess = false;
            await act(async () => {
                buySuccess = result.current.buyShopItem('new_item_123', 50);
            });
            expect(buySuccess).toBe(true);

            await act(async () => {
                result.current.equipItem('new_item_123', 'avatar');
            });

            expect(result.current.gamification.inventory.ownedItems).toContain('new_item_123');
            expect(result.current.gamification.inventory.ownedItems.length).toBe(initialOwnedCount + 1);
            expect(result.current.gamification.inventory.equippedAvatar).toBe('new_item_123');
        });
    });

    describe('PowerUps', () => {
        it('should allow buying a power up if balance is sufficient', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const price = 50;
            let success = false;

            await act(async () => {
                success = result.current.buyPowerUp('skip', price);
            });

            expect(success).toBe(true);
            expect(mockUpdateUserData).toHaveBeenCalled();
            await waitFor(() => {
                expect(result.current.userPowerUps.inventory['skip']).toBeGreaterThanOrEqual(1);
            });
        });

        it('should reject buying a power up if balance is insufficient', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const price = 200;
            let success = false;

            await act(async () => {
                success = result.current.buyPowerUp('skip', price);
            });

            expect(success).toBe(false);
            expect(mockUpdateUserData).not.toHaveBeenCalled();
        });

        it('should use a power up if available', async () => {
            (getGamification as any).mockResolvedValue(getFullMockData({
                powerUps: {
                    inventory: { 'skip': 1, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
                    usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
                    lastResetDate: new Date().toISOString().split('T')[0]
                }
            }));

            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));
            await waitFor(() => expect(result.current.userPowerUps.inventory['skip']).toBe(1));

            let used = false;
            await act(async () => {
                used = result.current.usePowerUp('skip');
            });

            expect(used).toBe(true);
            await waitFor(() => {
                expect(result.current.userPowerUps.inventory['skip']).toBe(0);
            });
        });
    });

    describe('World Achievements', () => {
        it('should unlock first_world achievement when completing a world', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                result.current.checkWorldAchievements('world1', 10, 10, 5);
            });

            await waitFor(() => {
                const hasAchievement = result.current.unlockedAchievements.some(a => a.id === 'first_world');
                expect(hasAchievement).toBe(true);
            });
        });

        it('should unlock perfect_world achievement if no mistakes made', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                result.current.checkWorldAchievements('world-perfect', 10, 10, 0);
            });

            await waitFor(() => {
                expect(result.current.unlockedAchievements.some(a => a.id === 'perfect_world')).toBe(true);
            });
        });

        it('should unlock world_master achievement after completing 1 world', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                result.current.checkWorldAchievements('world-master-test', 10, 10, 2);
            });

            await waitFor(() => {
                expect(result.current.unlockedAchievements.some(a => a.id === 'world_master')).toBe(true);
            });
        });
    });

    describe('Endgame Content', () => {
        it('should unlock endgame missions after completing first world', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            expect(result.current.activeMissions.some(m => m.missionId.startsWith('endgame_'))).toBe(false);

            await act(async () => {
                result.current.checkWorldAchievements('world-endgame', 10, 10, 5);
            });

            await waitFor(() => {
                const hasEndgame = result.current.activeMissions.some(m => m.missionId.startsWith('endgame_'));
                expect(hasEndgame).toBe(true);
            });
        });
    });

    describe('Daily Reset', () => {
        it('should reset usesToday if lastResetDate is old', async () => {
            const yesterday = '2020-01-01';
            const today = new Date().toISOString().split('T')[0];

            (getGamification as any).mockResolvedValue(getFullMockData({
                powerUps: {
                    inventory: { 'skip': 5 },
                    usesToday: { 'skip': 3 },
                    lastResetDate: yesterday
                }
            }));

            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            expect(result.current.userPowerUps.lastResetDate).toBe(today);
            expect(result.current.userPowerUps.usesToday['skip']).toBe(0);
        });
    });

    describe('Auto-Claim Integration', () => {
        beforeEach(() => {
            // Faking ONLY Date is safer for waitFor/act interactions
            vi.useFakeTimers({ toFake: ['Date'] });
            const date = new Date('2025-01-15T12:00:00Z');
            vi.setSystemTime(date);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should auto-claim mission and show notification when question triggers completion', async () => {
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

            // Use hoisted mock to override return value
            mockGenerateDaily.mockReturnValue([mockMission]);

            (getGamification as any).mockResolvedValue(getFullMockData({
                activeMissions: [], // Force hydrate/logic to use generateDailyMissions
                lastLoginDate: today
            }));

            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                // Pass stars in options correctly
                result.current.recordQuestionCompleted(true, 10, 0, { starsEarned: 5 });
            });

            await waitFor(() => {
                // Should be called ONCE with total balance/score
                // Initial balance: 100.
                // Question Stars: 5.
                // Mission Stars: 50.
                // Total Balance: 100 + 5 + 50 = 155.
                expect(mockUpdateUserData).toHaveBeenCalledTimes(1);

                expect(mockUpdateUserData).toHaveBeenLastCalledWith(expect.objectContaining({
                    balance: 155
                }));

                expect(result.current.missionNotification).toEqual(expect.objectContaining({
                    rewards: { stars: 50, xp: 200 }
                }));
            });
        });
    });

    describe('Guest Mode', () => {
        beforeEach(() => {
            vi.clearAllMocks();
            (useAuth as any).mockReturnValue({
                user: null,
                userData: null,
                isGuest: true,
                updateUserData: mockUpdateUserData,
            });
            vi.stubGlobal('localStorage', {
                getItem: vi.fn(),
                setItem: vi.fn(),
            });
        });

        it('should load gamification from localStorage for guest', async () => {
            const guestData = getFullMockData({ level: { totalXP: 999 } });
            (localStorage.getItem as any).mockReturnValue(JSON.stringify(guestData));

            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            expect(result.current.gamification.level.totalXP).toBe(999);
            expect(localStorage.getItem).toHaveBeenCalledWith('pyexplorer_guest_gamification');
        });

        it('should save to localStorage when guest makes progress', async () => {
            (localStorage.getItem as any).mockReturnValue(null);
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            await act(async () => {
                result.current.recordQuestionCompleted(true, 10, 5);
            });

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'pyexplorer_guest_gamification',
                expect.stringContaining('"totalXP":10')
            );
        });
    });
});
