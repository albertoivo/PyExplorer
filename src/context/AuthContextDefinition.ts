import { createContext } from 'react';
import type { User } from 'firebase/auth';
import type { UserData } from '../types/question';

/**
 * Interface do contexto de autenticação
 */
export interface AuthContextType {
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
    /** Função de login com Google */
    loginWithGoogle: () => Promise<void>;
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
