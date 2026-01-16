/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGamification } from '../useGamification';
import { useAuth } from '../useAuth';
import { saveGamificationData, getGamification } from '../../firebase/firestore';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { UserData } from '../../types/question';

// Mock dependências
vi.mock('../useAuth');
vi.mock('../../firebase/firestore');

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
        inventory: [],
        streak: 5,
        longestStreak: 10,
    };
    const mockUpdateUserData = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

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
        // Inventory object has ownedItems array
        expect(result.current.inventory.ownedItems.length).toBeGreaterThan(0);
        expect(result.current.streak.currentStreak).toBe(5);
        expect(result.current.streak.longestStreak).toBe(10);
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
            // Check if saveGamificationData was called or state updated
            await waitFor(() => {
                expect(result.current.userPowerUps.inventory['skip']).toBeGreaterThanOrEqual(1);
            });
        });

        it('should reject buying a power up if balance is insufficient', async () => {
            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            const price = 200; // Maior que 100
            let success = false;

            await act(async () => {
                success = result.current.buyPowerUp('skip', price);
            });

            expect(success).toBe(false);
            expect(mockUpdateUserData).not.toHaveBeenCalled();
            // Default inventory depends on initializer, but it shouldn't have changed
        });

        it('should use a power up if available', async () => {
            // Setup: user has 1 skip via getGamification
            (getGamification as any).mockResolvedValue(getFullMockData({
                powerUps: {
                    inventory: { 'skip': 1, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
                    usesToday: { skip: 0, fifty_fifty: 0, extra_hint: 0, double_stars: 0, shield: 0 },
                    lastResetDate: new Date().toISOString().split('T')[0]
                }
            }));

            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            // Verify initial state
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
    });

    describe('Daily Reset', () => {
        it('should reset usesToday if lastResetDate is old', async () => {
            const yesterday = '2020-01-01'; // Very old date
            const today = new Date().toISOString().split('T')[0];

            (getGamification as any).mockResolvedValue(getFullMockData({
                powerUps: {
                    inventory: { 'skip': 5 },
                    usesToday: { 'skip': 3 }, // Was used 3 times yesterday
                    lastResetDate: yesterday
                }
            }));

            const { result } = renderHook(() => useGamification());
            await waitFor(() => expect(result.current.loading).toBe(false));

            expect(result.current.userPowerUps.lastResetDate).toBe(today);
            expect(result.current.userPowerUps.usesToday['skip']).toBe(0);

            // Should have saved the reset state
            expect(saveGamificationData).toHaveBeenCalledWith(
                mockUser.uid,
                expect.objectContaining({
                    powerUps: expect.objectContaining({
                        lastResetDate: today,
                        usesToday: expect.objectContaining({ skip: 0 })
                    })
                })
            );
        });
    });
});
