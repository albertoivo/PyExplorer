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
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
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
