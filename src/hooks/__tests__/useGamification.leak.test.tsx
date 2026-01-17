/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor, act } from '@testing-library/react';
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

    it('should NOT leak state when switching rapidily between users (zombie check)', async () => {
        // This test simulates the "Zombie Update" scenario:
        // 1. User A loads
        // 2. User A schedules async achievement check (setTimeout 100ms)
        // 3. BEFORE timeout fires, we switch to User B
        // 4. Timeout fires -> It MUST NOT update state with User A's data

        // 1. Setup User A
        const userA = { uid: 'user_a', displayName: 'Super User' };
        // User A has completed world 1
        firestoreDataStore['user_a'] = {
            level: { level: 10, currentXP: 500, totalXP: 5000 },
            stats: { worldsCompleted: 5 },
            achievements: [],
            activeMissions: [],
            inventory: { ownedItems: [] },
            powerUps: { inventory: {}, usesToday: {} },
            streak: { currentStreak: 5, longestStreak: 5, lastActivityDate: '', activityHistory: [] }
        };

        // 2. Setup User B
        const userB = { uid: 'user_b', displayName: 'New User' };
        firestoreDataStore['user_b'] = {
            level: { level: 1, totalXP: 0 },
            stats: { worldsCompleted: 0 }, // Should be 0
            achievements: [],
            activeMissions: [],
            inventory: { ownedItems: [] },
            powerUps: { inventory: {}, usesToday: {} },
            streak: { currentStreak: 0 }
        };

        // Start with User A
        (useAuth as any).mockReturnValue({
            user: userA,
            userData: { uid: 'user_a', balance: 1000 },
            updateUserData: mockUpdateUserData,
        });

        const { result, rerender } = renderHook(() => useGamification());

        // Wait for A to load
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.gamification.stats.worldsCompleted).toBe(5);

        // 3. Switch to User B IMMEDIATELY
        (useAuth as any).mockReturnValue({
            user: userB,
            userData: { uid: 'user_b', balance: 0 },
            updateUserData: mockUpdateUserData,
        });
        rerender();

        // 4. Wait enough time for the 100ms timeout to fire
        await act(async () => {
            await new Promise(r => setTimeout(r, 200));
        });

        // 5. ASSERT: State should be User B's state (0 worlds completed)
        // If the zombie check ran, it would have overwritten this with 5
        expect(result.current.gamification.stats.worldsCompleted).toBe(0);
        expect(result.current.gamification.level.level).toBe(1);
    });
});
