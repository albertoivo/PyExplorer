import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { MascotMood } from '../components/mascot/Mascot';
import { getRandomMessage } from '../utils/mascotMessages';

// ============================================
// TIPOS
// ============================================

interface MascotState {
    mood: MascotMood;
    message: string | undefined;
    visible: boolean;
}

interface MascotContextType extends MascotState {
    /** Define o mood e mensagem do mascote */
    setMood: (mood: MascotMood, message?: string) => void;
    /** Mostra uma mensagem */
    showMessage: (message: string, mood?: MascotMood) => void;
    /** Esconde o mascote */
    hide: () => void;
    /** Mostra o mascote */
    show: () => void;
    /** Reage a uma resposta correta/incorreta */
    react: (correct: boolean) => void;
    /** Celebra uma conquista */
    celebrate: (message?: string) => void;
    /** Volta ao estado idle */
    reset: () => void;
}

const MascotContext = createContext<MascotContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface MascotProviderProps {
    children: ReactNode;
}

export function MascotProvider({ children }: MascotProviderProps) {
    const [state, setState] = useState<MascotState>({
        mood: 'idle',
        message: undefined,
        visible: true,
    });

    const setMood = useCallback((mood: MascotMood, message?: string) => {
        setState(prev => ({ ...prev, mood, message }));
    }, []);

    const showMessage = useCallback((message: string, mood: MascotMood = 'idle') => {
        setState(prev => ({ ...prev, message, mood }));
    }, []);

    const hide = useCallback(() => {
        setState(prev => ({ ...prev, visible: false }));
    }, []);

    const show = useCallback(() => {
        setState(prev => ({ ...prev, visible: true }));
    }, []);

    const react = useCallback((correct: boolean) => {
        if (correct) {
            setState({
                mood: Math.random() > 0.5 ? 'happy' : 'excited',
                message: getRandomMessage('correct'),
                visible: true,
            });
        } else {
            setState({
                mood: Math.random() > 0.5 ? 'encouraging' : 'confused',
                message: getRandomMessage('incorrect'),
                visible: true,
            });
        }
    }, []);

    const celebrate = useCallback((message?: string) => {
        setState({
            mood: 'celebrating',
            message: message || getRandomMessage('celebrate'),
            visible: true,
        });
    }, []);

    const reset = useCallback(() => {
        setState({
            mood: 'idle',
            message: undefined,
            visible: true,
        });
    }, []);

    const value = useMemo<MascotContextType>(() => ({
        ...state,
        setMood,
        showMessage,
        hide,
        show,
        react,
        celebrate,
        reset,
    }), [state, setMood, showMessage, hide, show, react, celebrate, reset]);

    return (
        <MascotContext.Provider value={value}>
            {children}
        </MascotContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

// eslint-disable-next-line react-refresh/only-export-components
export function useMascotContext(): MascotContextType {
    const context = useContext(MascotContext);
    if (!context) {
        throw new Error('useMascotContext deve ser usado dentro de MascotProvider');
    }
    return context;
}
