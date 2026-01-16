import { createContext, useContext, type ReactNode } from 'react';
import { useGamification as useGamificationHook } from '../hooks/useGamification';

const GamificationContext = createContext<ReturnType<typeof useGamificationHook> | null>(null);

/**
 * Provider para compartilhar estado de gamificação entre componentes
 */
export function GamificationProvider({ children }: { children: ReactNode }) {
    const gamification = useGamificationHook();
    return (
        <GamificationContext.Provider value={gamification}>
            {children}
        </GamificationContext.Provider>
    );
}

/**
 * Hook para acessar estado compartilhado de gamificação
 */
export function useGamification() {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within GamificationProvider');
    }
    return context;
}

export default GamificationProvider;
