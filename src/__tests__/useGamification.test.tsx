/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGamification } from '../hooks/useGamification';
import * as useAuthModule from '../hooks/useAuth';

// Mock dependencies
vi.mock('../firebase/firestore', () => ({
    getGamification: vi.fn(),
    saveGamificationData: vi.fn().mockResolvedValue(undefined),
}));

// Mock gamificationData if needed, or rely on real one since it's static
// But we need to ensure SHOP_ITEMS are consistent.
// We'll use the real ones.

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

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock for useAuth
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            userData: mockUserData as any,
            isGuest: false,
            updateUserData: mockUpdateUserData,
            refreshUserData: vi.fn(),
            // other props...
            user: {} as any,
            loading: false,
            error: null,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
            sendPasswordReset: vi.fn(),
            enterAsGuest: vi.fn(),
            clearError: vi.fn(),
        });
    });

    it('should allow buying an item if user has enough balance', async () => {
        const { result } = renderHook(() => useGamification());

        // Wait for initial load to finish
        await waitFor(() => expect(result.current.loading).toBe(false));

        const itemPrice = 100;
        const itemId = 'test_item_1';

        // Act
        let success;
        act(() => {
            success = result.current.buyShopItem(itemId, itemPrice);
        });

        // Assert
        expect(success).toBe(true);
        // Should deduct from balance
        expect(mockUpdateUserData).toHaveBeenCalledWith({
            balance: 400 // 500 - 100
        });

        // Should update local inventory state
        expect(result.current.inventory.ownedItems).toContain(itemId);
    });

    it('should NOT allow buying an item if user has insufficient balance', async () => {
        // Setup user with low balance
        vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
            userData: { ...mockUserData, balance: 50 } as any, // Only 50 stars
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
        });

        const { result } = renderHook(() => useGamification());

        // Wait for initial load to finish
        await waitFor(() => expect(result.current.loading).toBe(false));

        const itemPrice = 100;
        const itemId = 'test_item_2';

        // Act
        let success;
        act(() => {
            success = result.current.buyShopItem(itemId, itemPrice);
        });

        // Assert
        expect(success).toBe(false);
        expect(mockUpdateUserData).not.toHaveBeenCalled();
        expect(result.current.inventory.ownedItems).not.toContain(itemId);
    });

    it('should NOT allow buying an item if already owned', async () => {
        const { result } = renderHook(() => useGamification());

        // Wait for initial load to finish
        await waitFor(() => expect(result.current.loading).toBe(false));

        // First buy
        act(() => {
            result.current.buyShopItem('test_item_3', 100);
        });

        mockUpdateUserData.mockClear();

        // Try to buy again
        let success;
        act(() => {
            success = result.current.buyShopItem('test_item_3', 100);
        });

        expect(success).toBe(false);
        expect(mockUpdateUserData).not.toHaveBeenCalled();
    });
});
