import { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { logOut } from '../firebase/auth';
import { saveUser, getUser } from '../firebase/firestore';
import type { UserData } from '../types/question';

import { AuthContext, type AuthContextType } from './AuthContextDefinition';
import { GUEST_KEY } from '../utils/auth/authUtils';
import {
    useGoogleAuth,
    useGuestAuth,
    useEmailAuth,
    useAuthRedirect,
    useAuthState,
    useDomainRedirect
} from '../hooks/auth';

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Provider de autenticação que encapsula toda a lógica de login/cadastro
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { loginWithGoogle } = useGoogleAuth(setUserData, setError, setLoading);
    const { enterAsGuest } = useGuestAuth(setUserData, setIsGuest);
    const { login, register, sendPasswordReset } = useEmailAuth(setUserData, setError, setLoading);

    useAuthRedirect(setError);
    useAuthState(setUser, setUserData, setIsGuest, setLoading);
    useDomainRedirect();

    /**
     * Faz logout.
     * Não faz throw — erros são tratados via setError.
     */
    const logout = useCallback(async () => {
        setError(null);
        try {
            if (isGuest) {
                localStorage.removeItem(GUEST_KEY);
                setIsGuest(false);
                setUserData(null);
            } else {
                await logOut();
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao sair';
            setError(message);
        }
    }, [isGuest]);

    /**
     * Limpa mensagem de erro
     */
    const clearError = useCallback(() => setError(null), []);

    /**
     * Recarrega dados do usuário do Firestore
     */
    const refreshUserData = useCallback(async () => {
        if (user && !isGuest) {
            const data = await getUser(user.uid);
            setUserData(data);
        }
    }, [user, isGuest]);

    /**
     * Atualiza dados do usuário
     */
    const updateUserData = useCallback(async (updates: Partial<UserData>) => {
        if (!userData) return;

        const newData = { ...userData, ...updates, updatedAt: new Date() };
        setUserData(newData);

        if (isGuest) {
            localStorage.setItem(GUEST_KEY, JSON.stringify(newData));
        } else if (user) {
            try {
                await saveUser(newData);
            } catch (err) {
                console.error('Erro ao atualizar dados:', err);
            }
        }
    }, [userData, isGuest, user]);

    const value = useMemo<AuthContextType>(() => ({
        user,
        userData,
        loading,
        isGuest,
        error,
        login,
        register,
        logout,
        sendPasswordReset,
        enterAsGuest,
        clearError,
        refreshUserData,
        updateUserData,
        loginWithGoogle,
    }), [
        user,
        userData,
        loading,
        isGuest,
        error,
        login,
        register,
        logout,
        sendPasswordReset,
        enterAsGuest,
        clearError,
        refreshUserData,
        updateUserData,
        loginWithGoogle,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
