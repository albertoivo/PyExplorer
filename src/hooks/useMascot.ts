import { useState, useCallback } from 'react';
import type { MascotMood } from '../components/mascot/Mascot';

// ============================================
// HOOK PARA CONTROLAR O MASCOTE
// ============================================

interface MascotState {
    mood: MascotMood;
    message: string | undefined;
    visible: boolean;
}

const RANDOM_MESSAGES: Record<string, string[]> = {
    correct: [
        'Isso aí! Mandou bem!',
        'Perfeito! Você é demais!',
        'Acertou em cheio! 🎯',
        'Você está arrasando!',
        'Excelente trabalho!',
        'Uau! Muito bom!',
    ],
    incorrect: [
        'Não desiste! Você consegue!',
        'Quase lá! Tenta de novo!',
        'Errar faz parte! Vamos lá!',
        'Você está aprendendo! 💪',
        'Não se preocupa, tenta outra vez!',
    ],
    hint: [
        'Pensa com calma...',
        'Dica: leia a pergunta de novo!',
        'Você já sabe a resposta!',
        'Confia em você!',
    ],
    idle: [
        'Estou aqui se precisar!',
        'Vamos aprender juntos?',
        'Python é muito legal!',
        'Você sabia que Python foi criado em 1991?',
        'Curtindo o jogo? 🐍',
    ],
};

export function useMascot() {
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
            const messages = RANDOM_MESSAGES.correct;
            const random = messages[Math.floor(Math.random() * messages.length)];
            setState({
                mood: Math.random() > 0.5 ? 'happy' : 'excited',
                message: random,
                visible: true,
            });
        } else {
            const messages = RANDOM_MESSAGES.incorrect;
            const random = messages[Math.floor(Math.random() * messages.length)];
            setState({
                mood: Math.random() > 0.5 ? 'encouraging' : 'confused',
                message: random,
                visible: true,
            });
        }
    }, []);

    const celebrate = useCallback(() => {
        setState({
            mood: 'celebrating',
            message: 'PARABÉNS! Você completou! 🎉',
            visible: true,
        });
    }, []);

    return {
        ...state,
        setMood,
        showMessage,
        hide,
        show,
        react,
        celebrate,
    };
}
