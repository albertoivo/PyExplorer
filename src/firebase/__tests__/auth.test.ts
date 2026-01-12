/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../auth';
import type { User, UserCredential } from 'firebase/auth';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';

// Mock dependências
vi.mock('../firebaseConfig', () => ({
    auth: { currentUser: null }
}));

vi.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    updateProfile: vi.fn(),
    onAuthStateChanged: vi.fn(),
    getAuth: vi.fn(),
}));

describe('Auth Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('signUp', () => {
        const mockUserCredential = {
            user: { uid: 'u1', email: 'test@example.com' }
        } as UserCredential;

        it('should create user and update display name', async () => {
            (createUserWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);
            (updateProfile as any).mockResolvedValue(undefined);

            const result = await authService.signUp('test@example.com', '123456', 'Tester');

            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', '123456');
            expect(updateProfile).toHaveBeenCalledWith(mockUserCredential.user, { displayName: 'Tester' });
            expect(result).toBe(mockUserCredential);
        });

        it('should create user without display name if not provided', async () => {
            (createUserWithEmailAndPassword as any).mockResolvedValue(mockUserCredential);

            await authService.signUp('test@example.com', '123456');

            expect(createUserWithEmailAndPassword).toHaveBeenCalled();
            expect(updateProfile).not.toHaveBeenCalled();
        });
    });

    describe('signIn', () => {
        it('should sign in with email and password', async () => {
            const mockCred = { user: { uid: 'u1' } };
            (signInWithEmailAndPassword as any).mockResolvedValue(mockCred);

            const result = await authService.signIn('email@test.com', 'pass');

            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'email@test.com', 'pass');
            expect(result).toBe(mockCred);
        });
    });

    describe('logOut', () => {
        it('should sign out', async () => {
            await authService.logOut();
            expect(signOut).toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        it('should send password reset email', async () => {
            await authService.resetPassword('email@test.com');
            expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'email@test.com');
        });
    });

    describe('updateUserDisplayName', () => {
        it('should update profile', async () => {
            const mockUser = { uid: 'u1' } as User;
            await authService.updateUserDisplayName(mockUser, 'New Name');
            expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'New Name' });
        });
    });

    describe('subscribeToAuthChanges', () => {
        it('should register onAuthStateChanged listener', () => {
            const callback = vi.fn();
            const unsubscribe = vi.fn();
            (onAuthStateChanged as any).mockReturnValue(unsubscribe);

            const result = authService.subscribeToAuthChanges(callback);

            expect(onAuthStateChanged).toHaveBeenCalledWith(expect.anything(), callback);
            expect(result).toBe(unsubscribe);
        });
    });

    describe('getCurrentUser', () => {
        it('should return current user from auth instance', async () => {
            // Mock do auth importado dentro do módulo (via firebaseConfig)
            // Como vitest hoists mocks, precisamos manipular o mock do firebaseConfig se quisermos testar retorno diferente de null definido no topo
            // Mas como getCurrentUser ler diretamente da propriedade, o teste básico é se ele acessa.
            // O valor 'null' definido no topo é o esperado aqui.
            const user = authService.getCurrentUser();
            // O mock inicial define currentUser como null
            expect(user).toBeNull();
        });
    });
});
