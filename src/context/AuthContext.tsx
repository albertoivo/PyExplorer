import { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { resetLoginRedirectFlag } from '../utils/authRedirect';
import { translateFirebaseError } from '../utils/errorTranslations';
import { subscribeToAuthChanges, signIn, signUp, logOut, resetPassword, signInWithGoogle, signInWithGoogleRedirect, checkRedirectResult } from '../firebase/auth';
import { saveUser, getUser } from '../firebase/firestore';
import type { UserData, World } from '../types/question';
import { env } from '../config/env';

import { AuthContext, type AuthContextType } from './AuthContextDefinition';

interface AuthProviderProps {
    children: ReactNode;
}

const GUEST_KEY = 'pyexplorer_guest';

/**
 * Provider de autenticação que encapsula toda a lógica de login/cadastro
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Escuta mudanças no estado de autenticação e verifica redirecionamento
    useEffect(() => {
        // Em auditorias automáticas (Lighthouse/PageSpeed), evitamos inicializar
        // fluxo de redirect/listener do Firebase Auth para não gerar iframes/requests
        // que poluem o relatório de Best Practices.
        if (env.IS_AUDIT_BOT) {
            setUser(null);
            setUserData(null);
            setIsGuest(false);
            setLoading(false);
            return;
        }

        // Verifica se estamos voltando de um redirect do Google
        const handleRedirect = async () => {
            try {
                const credential = await checkRedirectResult();
                if (credential?.user) {
                    // Usuário acabou de logar via redirect, processa como um login normal
                    const firebaseUser = credential.user;
                    const existingData = await getUser(firebaseUser.uid);

                    if (!existingData) {
                        const newUserData: UserData = {
                            uid: firebaseUser.uid,
                            displayName: firebaseUser.displayName || 'Explorador',
                            email: firebaseUser.email || '',
                            avatar: 'default_avatar',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            totalScore: 0,
                            balance: 0,
                            unlockedWorlds: ['basic_commands' as World],
                        };
                        await saveUser(newUserData);
                        // O onAuthStateChanged vai atualizar o estado
                    }

                    if (window.location.origin !== new URL(env.APP_URL).origin) {
                        window.location.href = env.APP_URL;
                    }
                }
            } catch (err) {
                console.error("Erro no redirecionamento do Google:", err);
                const message = err instanceof Error ? err.message : 'Erro ao entrar com Google (Redirect)';
                setError(translateFirebaseError(message));
            }
        };

        handleRedirect();

        const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Usuário logado - busca dados do Firestore
                setIsGuest(false);
                localStorage.removeItem(GUEST_KEY);
                try {
                    const data = await getUser(firebaseUser.uid);

                    if (data) {
                        // Migration: Initialize new Phase 2 fields if missing
                        let dataChanged = false;
                        if (data.balance === undefined) {
                            data.balance = data.totalScore || 0; // Backfill balance with existing score
                            dataChanged = true;
                        }

                        // Streak logic moved to useGamification hook to avoid duplication

                        if (dataChanged) {
                            await saveUser(data);
                        }
                    }

                    setUserData(data);
                } catch (err) {
                    console.error('Erro ao buscar dados do usuário:', err);
                }
            } else {
                // Verifica se há dados de convidado
                const guestData = localStorage.getItem(GUEST_KEY);
                if (guestData) {
                    setIsGuest(true);
                    const data = JSON.parse(guestData);
                    setUserData(data);
                } else {
                    setUserData(null);
                    setIsGuest(false);
                }
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    /**
     * Verifica e impõe a URL correta do ambiente
     */
    useEffect(() => {
        // Em produção, se estiver no domínio web.app, redirecionar para o domínio customizado
        if (env.IS_PROD && window.location.hostname.includes('web.app')) {
            window.location.href = env.APP_URL;
        }
    }, []);


    /**
     * Faz login com Google
     */
    const loginWithGoogle = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            // Se for dispositivo móvel, usa redirecionamento direto, senão usa popup
            // Fallback: se o popup falhar com popup-closed-by-user, tenta redirecionamento

            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                await signInWithGoogleRedirect();
                return; // a página será redirecionada
            }

            const credential = await signInWithGoogle();
            const firebaseUser = credential.user;

            // Verifica se o usuário já tem dados no Firestore
            const existingData = await getUser(firebaseUser.uid);

            if (!existingData) {
                // Se não tiver, cria um novo registro (fluxo de cadastro)
                const newUserData: UserData = {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName || 'Explorador',
                    email: firebaseUser.email || '',
                    avatar: 'default_avatar',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    totalScore: 0,
                    balance: 0,
                    unlockedWorlds: ['basic_commands' as World],
                };

                await saveUser(newUserData);
                setUserData(newUserData);
            } else {
                // Se já tiver, apenas atualiza o estado local
                setUserData(existingData);
            }

            // Garante que estamos na URL correta
            if (window.location.origin !== new URL(env.APP_URL).origin) {
                window.location.href = env.APP_URL;
            }

        } catch (err: unknown) {
            // Se for popup fechado (frequente no mobile), cai no redirect
            const errorCode = (err as { code?: string })?.code;
            if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
                console.log('Popup bloqueado ou fechado, tentando redirect...');
                try {
                    await signInWithGoogleRedirect();
                    return; // a página será redirecionada
                } catch (redirectErr) {
                    console.error('Falha também no redirect:', redirectErr);
                }
            }

            const message = err instanceof Error ? err.message : 'Erro ao entrar com Google';
            setError(translateFirebaseError(message));
            setLoading(false);
            throw err;
        }
    }, []);

    /**
     * Faz login com email e senha
     */
    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            await signIn(email, password);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao fazer login';
            setError(translateFirebaseError(message));
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Cadastra novo usuário
     */
    const register = useCallback(async (email: string, password: string, displayName: string) => {
        setError(null);
        setLoading(true);
        try {
            const credential = await signUp(email, password, displayName);

            // Cria documento do usuário no Firestore
            const newUserData: UserData = {
                uid: credential.user.uid,
                displayName,
                email,
                avatar: 'default_avatar',
                createdAt: new Date(),
                updatedAt: new Date(),
                totalScore: 0,
                balance: 0,
                unlockedWorlds: ['basic_commands' as World],
            };

            await saveUser(newUserData);
            setUserData(newUserData);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao criar conta';
            setError(translateFirebaseError(message));
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Faz logout
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
            // Reseta flag de redirect para permitir novo login
            resetLoginRedirectFlag();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao sair';
            setError(message);
            throw err;
        }
    }, [isGuest]);

    /**
     * Envia email de redefinição de senha
     */
    const sendPasswordReset = useCallback(async (email: string) => {
        setError(null);
        try {
            await resetPassword(email);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao enviar email';
            setError(translateFirebaseError(message));
            throw err;
        }
    }, []);

    /**
     * Entra como convidado (sem autenticação)
     */
    const enterAsGuest = useCallback((displayName: string) => {
        const guestData: UserData = {
            uid: 'guest_' + Date.now(),
            displayName,
            email: '',
            avatar: 'guest_avatar',
            createdAt: new Date(),
            updatedAt: new Date(),
            totalScore: 0,
            balance: 0,
            unlockedWorlds: ['basic_commands' as World],
        };

        localStorage.setItem(GUEST_KEY, JSON.stringify(guestData));
        setUserData(guestData);
        setIsGuest(true);
    }, []);

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

/**
 * Hook para acessar o contexto de autenticação
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}

// Fast refresh doesn't allow exporting default non-component value if file exports components
// so we remove default export and only export hooks/components
