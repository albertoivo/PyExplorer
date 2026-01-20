/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as authModule from '../../firebase/auth';
import * as firestoreModule from '../../firebase/firestore';

// Mock dependencies
vi.mock('../../firebase/auth');
vi.mock('../../firebase/firestore');

// Wrapper for testing hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
    let localStorageStore: Record<string, string> = {};

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup LocalStorage Mock
        localStorageStore = {};

        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key: string) => localStorageStore[key] || null),
            setItem: vi.fn((key: string, value: string) => {
                localStorageStore[key] = value;
            }),
            removeItem: vi.fn((key: string) => {
                delete localStorageStore[key];
            }),
            clear: vi.fn(() => {
                localStorageStore = {};
            }),
        });
    });

    it('initializes with loading state', async () => {
        // Mock subscribeToAuthChanges to NOT resolve immediately or resolve with null
        (authModule.subscribeToAuthChanges as any).mockImplementation(() => vi.fn());

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.loading).toBe(true);
    });

    it('loads user and data when authenticated', async () => {
        const mockUser = { uid: 'user123', email: 'test@example.com' };
        const mockUserData = {
            uid: 'user123',
            email: 'test@example.com',
            balance: 100,
            streak: 5,
            lastActiveDate: new Date().toISOString().split('T')[0]
        };

        (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            callback(mockUser);
            return vi.fn();
        });
        (firestoreModule.getUser as any).mockResolvedValue(mockUserData);
        (firestoreModule.saveUser as any).mockResolvedValue(undefined);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.user).toBe(mockUser);
        expect(result.current.userData).toEqual(mockUserData);
        expect(result.current.isGuest).toBe(false);
    });

    it('handles guest login', async () => {
        (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            callback(null);
            return vi.fn();
        });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.enterAsGuest('Guest User');
        });

        expect(result.current.isGuest).toBe(true);
        expect(result.current.userData?.displayName).toBe('Guest User');
        expect(result.current.user).toBeNull();

        const storedGuest = localStorage.getItem('pyexplorer_guest');
        expect(storedGuest).not.toBeNull();
        if (storedGuest) {
             expect(storedGuest).toContain('Guest User');
        }
    });

    it('handles guest login persistence', async () => {
        // Setup existing guest data in localStorage
        const guestData = {
            uid: 'guest_123',
            displayName: 'Stored Guest',
            streak: 2,
            lastActiveDate: new Date().toISOString().split('T')[0]
        };
        localStorage.setItem('pyexplorer_guest', JSON.stringify(guestData));

        (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            callback(null);
            return vi.fn();
        });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.isGuest).toBe(true);
        expect(result.current.userData?.displayName).toBe('Stored Guest');
    });

    it('register creates user and saves to firestore', async () => {
        const mockUser = { uid: 'new123' };
        (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            // Initially null
            callback(null);
            return vi.fn();
        });
        (authModule.signUp as any).mockResolvedValue({ user: mockUser });
        (firestoreModule.saveUser as any).mockResolvedValue(undefined);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.register('new@example.com', 'password', 'New User');
        });

        expect(authModule.signUp).toHaveBeenCalledWith('new@example.com', 'password', 'New User');
        expect(firestoreModule.saveUser).toHaveBeenCalledWith(expect.objectContaining({
            uid: 'new123',
            displayName: 'New User',
            email: 'new@example.com'
        }));
    });

    it('login signs in user', async () => {
        (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            callback(null);
            return vi.fn();
        });
        (authModule.signIn as any).mockResolvedValue({});

        const { result } = renderHook(() => useAuth(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });

        expect(authModule.signIn).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('handles login error', async () => {
        (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            callback(null);
            return vi.fn();
        });
        (authModule.signIn as any).mockRejectedValue(new Error('auth/user-not-found'));

        const { result } = renderHook(() => useAuth(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            try {
                await result.current.login('wrong@example.com', 'password');
            } catch {
                // Ignore expected error
            }
        });

        expect(result.current.error).toBe('Usuário não encontrado');
    });

    it('logout clears state', async () => {
         const mockUser = { uid: 'user123' };
         (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            callback(mockUser);
            return vi.fn();
        });

        const { result } = renderHook(() => useAuth(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.logout();
        });

        expect(authModule.logOut).toHaveBeenCalled();
    });

    it('guest logout clears local storage', async () => {
        (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            callback(null);
            return vi.fn();
        });

        const { result } = renderHook(() => useAuth(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.enterAsGuest('Guest');
        });

        expect(localStorage.getItem('pyexplorer_guest')).not.toBeNull();

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.isGuest).toBe(false);
        expect(result.current.userData).toBeNull();
        expect(localStorage.getItem('pyexplorer_guest')).toBeNull();
    });

    it('updates user data', async () => {
         const mockUser = { uid: 'user123' };
         const mockUserData = { uid: 'user123', balance: 100 };

         (authModule.subscribeToAuthChanges as any).mockImplementation((callback: any) => {
            callback(mockUser);
            return vi.fn();
        });
        (firestoreModule.getUser as any).mockResolvedValue(mockUserData);

        const { result } = renderHook(() => useAuth(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.updateUserData({ balance: 200 });
        });

        expect(firestoreModule.saveUser).toHaveBeenCalledWith(expect.objectContaining({
            uid: 'user123',
            balance: 200
        }));
    });
});
