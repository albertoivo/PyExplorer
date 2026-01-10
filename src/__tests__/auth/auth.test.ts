import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, signIn, logOut, resetPassword, updateUserDisplayName, subscribeToAuthChanges, getCurrentUser } from '../../firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';

// Mock dependencies
vi.mock('../../firebase/firebaseConfig', () => ({
    auth: { currentUser: null },
}));

vi.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    updateProfile: vi.fn(),
    onAuthStateChanged: vi.fn(),
}));

describe('firebase/auth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('signUp should create user and update profile', async () => {
        const mockUser = { uid: '123' };
        const mockCredential = { user: mockUser };
        (createUserWithEmailAndPassword as any).mockResolvedValue(mockCredential);
        (updateProfile as any).mockResolvedValue(undefined);

        const result = await signUp('test@example.com', 'password', 'Test User');

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
        expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test User' });
        expect(result).toBe(mockCredential);
    });

    it('signIn should log in user', async () => {
        const mockCredential = { user: { uid: '123' } };
        (signInWithEmailAndPassword as any).mockResolvedValue(mockCredential);

        const result = await signIn('test@example.com', 'password');

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
        expect(result).toBe(mockCredential);
    });

    it('logOut should sign out', async () => {
        (signOut as any).mockResolvedValue(undefined);

        await logOut();

        expect(signOut).toHaveBeenCalledWith(auth);
    });

    it('resetPassword should send email', async () => {
        (sendPasswordResetEmail as any).mockResolvedValue(undefined);

        await resetPassword('test@example.com');

        expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com');
    });

    it('updateUserDisplayName should update profile', async () => {
        const mockUser = { uid: '123' };
        (updateProfile as any).mockResolvedValue(undefined);

        await updateUserDisplayName(mockUser as any, 'New Name');

        expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'New Name' });
    });

    it('subscribeToAuthChanges should register callback', () => {
        const callback = vi.fn();
        const unsubscribe = vi.fn();
        (onAuthStateChanged as any).mockReturnValue(unsubscribe);

        const result = subscribeToAuthChanges(callback);

        expect(onAuthStateChanged).toHaveBeenCalledWith(auth, callback);
        expect(result).toBe(unsubscribe);
    });

    it('getCurrentUser should return current user', () => {
        const mockUser = { uid: '123' };
        // We modify the imported object directly for testing
        (auth as any).currentUser = mockUser;

        const result = getCurrentUser();

        expect(result).toBe(mockUser);
    });
});
