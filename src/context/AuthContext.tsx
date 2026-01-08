import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuthChanges, signIn, signUp, logOut, resetPassword } from '../firebase/auth';
import { saveUser, getUser } from '../firebase/firestore';
import type { UserData, World } from '../types/question';

/**
 * Interface do contexto de autenticação
 */
interface AuthContextType {
    /** Usuário atual do Firebase */
    user: User | null;
    /** Dados do usuário no Firestore */
    userData: UserData | null;
    /** Se está carregando estado de autenticação */
    loading: boolean;
    /** Se está em modo convidado (sem login) */
    isGuest: boolean;
    /** Erro de autenticação */
    error: string | null;
    /** Função de login */
    login: (email: string, password: string) => Promise<void>;
    /** Função de cadastro */
    register: (email: string, password: string, displayName: string) => Promise<void>;
    /** Função de logout */
    logout: () => Promise<void>;
    /** Função de redefinição de senha */
    sendPasswordReset: (email: string) => Promise<void>;
    /** Entrar como convidado */
    enterAsGuest: (displayName: string) => void;
    /** Limpar erro */
    clearError: () => void;
    /** Recarregar dados do usuário */
    refreshUserData: () => Promise<void>;
    /** Atualizar dados do usuário */
    updateUserData: (updates: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

    // Escuta mudanças no estado de autenticação
    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Usuário logado - busca dados do Firestore
                setIsGuest(false);
                localStorage.removeItem(GUEST_KEY);
                try {
                    const data = await getUser(firebaseUser.uid);
                    setUserData(data);
                } catch (err) {
                    console.error('Erro ao buscar dados do usuário:', err);
                }
            } else {
                // Verifica se há dados de convidado
                const guestData = localStorage.getItem(GUEST_KEY);
                if (guestData) {
                    setIsGuest(true);
                    setUserData(JSON.parse(guestData));
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
     * Faz login com email e senha
     */
    const login = async (email: string, password: string) => {
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
    };

    /**
     * Cadastra novo usuário
     */
    const register = async (email: string, password: string, displayName: string) => {
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
    };

    /**
     * Faz logout
     */
    const logout = async () => {
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
            throw err;
        }
    };

    /**
     * Envia email de redefinição de senha
     */
    const sendPasswordReset = async (email: string) => {
        setError(null);
        try {
            await resetPassword(email);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao enviar email';
            setError(translateFirebaseError(message));
            throw err;
        }
    };

    /**
     * Entra como convidado (sem autenticação)
     */
    const enterAsGuest = (displayName: string) => {
        const guestData: UserData = {
            uid: 'guest_' + Date.now(),
            displayName,
            email: '',
            avatar: 'guest_avatar',
            createdAt: new Date(),
            updatedAt: new Date(),
            totalScore: 0,
            unlockedWorlds: ['basic_commands' as World],
        };

        localStorage.setItem(GUEST_KEY, JSON.stringify(guestData));
        setUserData(guestData);
        setIsGuest(true);
    };

    /**
     * Limpa mensagem de erro
     */
    const clearError = () => setError(null);

    /**
     * Recarrega dados do usuário do Firestore
     */
    const refreshUserData = async () => {
        if (user && !isGuest) {
            const data = await getUser(user.uid);
            setUserData(data);
        }
    };

    /**
     * Atualiza dados do usuário
     */
    const updateUserData = async (updates: Partial<UserData>) => {
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
    };

    const value: AuthContextType = {
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
    };

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

/**
 * Traduz mensagens de erro do Firebase para português
 */
function translateFirebaseError(message: string): string {
    const translations: Record<string, string> = {
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/email-already-in-use': 'Este email já está em uso',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
        'auth/invalid-email': 'Email inválido',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
    };

    for (const [code, translation] of Object.entries(translations)) {
        if (message.includes(code)) {
            return translation;
        }
    }

    return message;
}

// Fast refresh doesn't allow exporting default non-component value if file exports components
// so we remove default export and only export hooks/components
export default AuthContext;
