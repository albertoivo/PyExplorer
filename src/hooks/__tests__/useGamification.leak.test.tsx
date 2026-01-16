/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from '@testing-library/react';
import { useGamification } from '../useGamification';
import { useAuth } from '../useAuth';
import { getGamification, saveGamificationData } from '../../firebase/firestore';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependências
vi.mock('../useAuth');
vi.mock('../../firebase/firestore');

describe('useGamification Leak Test', () => {
    let firestoreDataStore: Record<string, any> = {};
    const mockUpdateUserData = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        firestoreDataStore = {};

        // Default mock implementation
        (useAuth as any).mockReturnValue({
            user: null,
            userData: null,
            updateUserData: mockUpdateUserData,
        });

        (getGamification as any).mockImplementation(async (uid: string) => {
            return firestoreDataStore[uid] || null;
        });

        (saveGamificationData as any).mockImplementation(async (uid: string, data: any) => {
            firestoreDataStore[uid] = data;
        });
    });

    it('should reset state when switching from SuperUser to NewUser', async () => {
        // 1. Setup User A (Super User)
        const userA = { uid: 'user_a', displayName: 'Super User' };
        const userDataA = { uid: 'user_a', balance: 1000, totalScore: 5000 };

        firestoreDataStore['user_a'] = {
            level: { level: 10, currentXP: 500, totalXP: 5000 },
            stats: { worldsCompleted: 5 },
            achievements: [],
            activeMissions: [],
            inventory: { ownedItems: [] },
            powerUps: { inventory: {}, usesToday: {} },
            streak: { currentStreak: 5, longestStreak: 5, lastActivityDate: '', activityHistory: [] }
        };

        // Mock User A before rendering
        (useAuth as any).mockReturnValue({
            user: userA,
            userData: userDataA,
            updateUserData: mockUpdateUserData,
        });

        const { result, rerender } = renderHook(() => useGamification());

        // Wait for User A data to load
        await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });
        expect(result.current.currentLevel.level).toBe(10);
        expect(result.current.gamification.stats.worldsCompleted).toBe(5);

        // 2. Switch to User B (New User)
        const userB = { uid: 'user_b', displayName: 'New User' };
        const userDataB = { uid: 'user_b', balance: 0, totalScore: 0 };

        // Update mock and rerender
        (useAuth as any).mockReturnValue({
            user: userB,
            userData: userDataB,
            updateUserData: mockUpdateUserData,
        });

        rerender();

        // 3. Wait for User B to finish loading and state to reset
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.currentLevel.level).toBe(1);
            expect(result.current.gamification.level.totalXP).toBe(0);
        }, { timeout: 3000 });

        // 4. ASSERT: Stats should also be reset
        expect(result.current.gamification.stats.worldsCompleted).toBe(0);

        // Verify that we saved the FRESH state to User B's firestore
        expect(saveGamificationData).toHaveBeenCalledWith('user_b', expect.objectContaining({
            level: expect.objectContaining({ totalXP: 0 })
        }));
    });
});
