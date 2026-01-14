import { act, waitFor, renderHook } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthContext';
import { useContext } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as firebaseAuth from '../firebase/auth';
import * as firestore from '../firebase/firestore';

// Mock das dependências
vi.mock('../firebase/auth', () => ({
    signIn: vi.fn(),
    signInWithGoogle: vi.fn(),
    signUp: vi.fn(),
    logOut: vi.fn(),
    subscribeToAuthChanges: vi.fn(),
    translateFirebaseError: (msg: string) => `Translated: ${msg}`,
}));

vi.mock('../firebase/firestore', () => ({
    getUser: vi.fn(),
    saveUser: vi.fn(),
}));

vi.mock('../config/env', () => ({
    env: {
        APP_URL: 'http://localhost:3000',
        IS_PROD: false,
    },
}));

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock do subscribe para executar callback imediato com null (usuário deslogado)
        (firebaseAuth.subscribeToAuthChanges as unknown as ReturnType<typeof vi.fn>).mockImplementation((callback: (user: unknown) => void) => {
            callback(null);
            return () => { };
        });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
    );

    const useAuthContext = () => useContext(AuthContext);

    it('deve fornecer o estado inicial correto', async () => {
        const { result } = renderHook(() => useAuthContext(), { wrapper });

        await waitFor(() => {
            expect(result.current?.loading).toBe(false);
        });

        expect(result.current?.user).toBeNull();
        expect(result.current?.userData).toBeNull();
        expect(result.current?.error).toBeNull();
    });

    it('deve realizar login com sucesso', async () => {
        const mockUser = { uid: '123', email: 'teste@teste.com' };
        const mockUserData = { uid: '123', displayName: 'Teste' };

        (firebaseAuth.signIn as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: mockUser });
        (firestore.getUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserData);

        // Simular mudança de auth state
        (firebaseAuth.subscribeToAuthChanges as unknown as ReturnType<typeof vi.fn>).mockImplementation((callback: (user: unknown) => void) => {
            // Simula login imediato ou pode ser chamado depois
            callback(mockUser);
            return () => { };
        });

        const { result } = renderHook(() => useAuthContext(), { wrapper });

        // A execução do login é disparada pelo usuário
        await act(async () => {
            await result.current?.login('teste@teste.com', '123456');
        });

        expect(firebaseAuth.signIn).toHaveBeenCalledWith('teste@teste.com', '123456');
        expect(firestore.getUser).toHaveBeenCalledWith('123');
    });

    it('deve tratar erro de login inválido', async () => {
        const errorMsg = 'auth/invalid-credential';
        (firebaseAuth.signIn as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMsg));

        const { result } = renderHook(() => useAuthContext(), { wrapper });

        await act(async () => {
            try {
                await result.current?.login('errado@teste.com', '123456');
            } catch {
                // Erro esperado
            }
        });

        expect(firebaseAuth.signIn).toHaveBeenCalled();
        expect(result.current?.error).toBe('Email ou senha incorretos');
    });

    it('deve realizar login com Google (Popup Flow) com sucesso', async () => {
        const mockUser = { uid: 'google-uid', displayName: 'Google User', email: 'google@test.com' };
        const mockUserData = { uid: 'google-uid', displayName: 'Google User', unlockedWorlds: [] };

        (firebaseAuth.signInWithGoogle as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: mockUser });
        (firestore.getUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserData); // Usuário existe

        const { result } = renderHook(() => useAuthContext(), { wrapper });

        await act(async () => {
            await result.current?.loginWithGoogle();
        });

        expect(firebaseAuth.signInWithGoogle).toHaveBeenCalled();
        expect(firestore.getUser).toHaveBeenCalledWith('google-uid');
        expect(firestore.saveUser).not.toHaveBeenCalled(); // Não deve salvar se já existe
        expect(result.current?.userData).toEqual(mockUserData);
    });

    it('deve criar novo usuário ao logar com Google se não existir', async () => {
        const mockUser = { uid: 'new-uid', displayName: 'New User', email: 'new@test.com' };

        (firebaseAuth.signInWithGoogle as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ user: mockUser });
        (firestore.getUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null); // Usuário não existe
        (firestore.saveUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);

        const { result } = renderHook(() => useAuthContext(), { wrapper });

        await act(async () => {
            await result.current?.loginWithGoogle();
        });

        expect(firebaseAuth.signInWithGoogle).toHaveBeenCalled();
        expect(firestore.getUser).toHaveBeenCalledWith('new-uid');
        expect(firestore.saveUser).toHaveBeenCalledWith(expect.objectContaining({
            uid: 'new-uid',
            email: 'new@test.com',
            displayName: 'New User'
        }));
    });
});
