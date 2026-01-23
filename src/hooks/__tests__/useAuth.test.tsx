import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthProvider } from '../../context/AuthContext';
import { subscribeToAuthChanges, signInWithGoogle, logOut } from '../../firebase/auth';
import { getUser, saveUser } from '../../firebase/firestore';
import { calculateStreak } from '../../utils/gamificationUtils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { User } from 'firebase/auth';
import type { UserData } from '../../types/question';

// --- MOCKS ---
vi.mock('../../firebase/auth', () => ({
    subscribeToAuthChanges: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    logOut: vi.fn(),
    resetPassword: vi.fn(),
    signInWithGoogle: vi.fn(),
}));

vi.mock('../../firebase/firestore', () => ({
    getUser: vi.fn(),
    saveUser: vi.fn(),
}));

vi.mock('../../utils/gamificationUtils', () => ({
    calculateStreak: vi.fn(),
}));

// Mock env to avoid window location reload in test
vi.mock('../../config/env', () => ({
    env: {
        IS_PROD: false,
        APP_URL: 'http://localhost:3000'
    }
}));

describe('useAuth Hook', () => {
    // Helper helper to simulate auth state change
    let authCallback: (user: User | null) => Promise<void>;

    const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('localStorage', localStorageMock);

        // Capture the callback passed to subscribeToAuthChanges
        (subscribeToAuthChanges as unknown as ReturnType<typeof vi.fn>).mockImplementation((cb) => {
            authCallback = cb;
            return () => { }; // return unsubscribe fn
        });

        // Default streak calculation 
        (calculateStreak as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            streak: 1,
            longestStreak: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            shouldUpdate: false
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
    );

    it('should initialize with loading state', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(result.current?.loading).toBe(true);

        // Simulate auth check finishing with null user
        await act(async () => {
            if (authCallback) await authCallback(null);
        });

        expect(result.current?.loading).toBe(false);
        expect(result.current?.user).toBeNull();
    });

    it('should handle authenticated user login and fetch data', async () => {
        const mockUser = { uid: '123', email: 'test@test.com' } as User;
        const mockUserData: UserData = {
            uid: '123',
            totalScore: 100,
            balance: 100
        } as UserData;

        (getUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserData);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            if (authCallback) await authCallback(mockUser);
        });

        expect(getUser).toHaveBeenCalledWith('123');
        expect(result.current?.user).toBe(mockUser);
        expect(result.current?.userData).toEqual(mockUserData);
        expect(result.current?.isGuest).toBe(false);
    });


    it('should handle Google Login (New User)', async () => {
        const mockUser = { uid: 'new-google', displayName: 'Google User', email: 'g@g.com' } as User;

        (signInWithGoogle as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: mockUser });
        (getUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null); // No existing data

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current?.loginWithGoogle();
        });

        expect(saveUser).toHaveBeenCalledWith(expect.objectContaining({
            uid: 'new-google',
            displayName: 'Google User',
            totalScore: 0
        }));
    });

    it('should enter as guest', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // First ensure initial load finishes
        await act(async () => {
            if (authCallback) await authCallback(null);
        });

        await act(async () => {
            result.current?.enterAsGuest('Little Explorer');
        });

        expect(result.current?.isGuest).toBe(true);
        expect(result.current?.userData?.displayName).toBe('Little Explorer');
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should load guest from localStorage', async () => {
        const guestData = { uid: 'guest-1', displayName: 'Stored Guest' };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(guestData));

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            if (authCallback) await authCallback(null);
        });

        expect(result.current?.isGuest).toBe(true);
        expect(result.current?.userData?.displayName).toBe('Stored Guest');
    });

    it('should logout and clear state', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current?.logout();
        });

        expect(logOut).toHaveBeenCalled();
    });
});
