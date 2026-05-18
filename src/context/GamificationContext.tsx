import { useContext, useMemo, type ReactNode } from 'react';
import { GamificationContext } from './GamificationContextDefinition';
import { useGamification as useGamificationHook } from '../hooks/useGamification';

/**
 * Provider para compartilhar estado de gamificação entre componentes
 */
export function GamificationProvider({ children }: { children: ReactNode }) {
    const gamification = useGamificationHook();
    const contextValue = useMemo(() => gamification, [gamification]);
    return (
        <GamificationContext.Provider value={contextValue}>
            {children}
        </GamificationContext.Provider>
    );
}

/**
 * Hook para acessar estado compartilhado de gamificação
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useGamification() {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within GamificationProvider');
    }
    return context;
}


