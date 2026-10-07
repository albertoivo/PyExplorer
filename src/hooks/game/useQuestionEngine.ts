import { useState, useCallback } from 'react';
import type { QuestionDocument } from '../../types/question';
import type { HintLevel } from '../../types/education';
import type { PowerUpType } from '../../types/gamification';
import { playSound } from '../../utils/soundEffects';
import { useAuth } from '../useAuth';
import { usePyodide } from '../../context/PyodideContext';
import { useMascotContext } from '../../context/MascotContext';
import { calculateScore } from '../../utils/progressLogic';

// Chave para armazenar dicas usadas
export const USED_HINTS_KEY = 'pyexplorer_used_hints';

type ConfettiFn = (options?: {
    particleCount?: number;
    spread?: number;
    origin?: { y: number };
    colors?: string[];
}) => void;

interface UseQuestionEngineProps {
    question: QuestionDocument;
    onComplete: (passed: boolean, score: number) => void;
    onNext: () => void;
    onRetry?: () => void;
    readOnly?: boolean;
    activePowerUp?: PowerUpType | null;
}

export function useQuestionEngine({
    question,
    onComplete,
    onNext,
    onRetry,
    readOnly = false,
    activePowerUp,
}: UseQuestionEngineProps) {
    const { userData, updateUserData } = useAuth();
    const { runPython, executing: isExecuting } = usePyodide();
    const { react: mascotReact } = useMascotContext();

    // Estados mudam com a questão
    const [showResult, setShowResult] = useState(readOnly);
    const [isCorrect, setIsCorrect] = useState(readOnly);
    const [showHints, setShowHints] = useState(false);
    const effectiveShowHints = showHints || activePowerUp === 'extra_hint';

    // Otimização: Inicialização preguiçosa para evitar leitura síncrona do localStorage a cada render
    const [revealedHints, setRevealedHints] = useState<HintLevel[]>(() => {
        try {
            const stored = localStorage.getItem(USED_HINTS_KEY);
            if (stored) {
                const map: Record<string, HintLevel[]> = JSON.parse(stored);
                return map[question.id] || [];
            }
        } catch {
            // Ignora erros
        }
        return [];
    });
    const [hintsCost, setHintsCost] = useState(0);

    const saveUsedHints = useCallback((hints: HintLevel[]) => {
        try {
            const stored = localStorage.getItem(USED_HINTS_KEY);
            const map: Record<string, HintLevel[]> = stored ? JSON.parse(stored) : {};
            map[question.id] = hints;
            localStorage.setItem(USED_HINTS_KEY, JSON.stringify(map));
        } catch {
            // Ignora erros
        }
    }, [question.id]);

    const handleHintRevealed = useCallback((level: HintLevel, cost: number) => {
        const newRevealed = [...revealedHints, level];
        setRevealedHints(newRevealed);
        setHintsCost(prev => prev + cost);
        saveUsedHints(newRevealed);

        if (cost > 0 && userData) {
            // Deduzir custo tanto do score total quanto do saldo (como uma "compra")
            // Decisão: Hints custam 'pontos de score' da questão E 'moedas/estrelas'?
            // Normalmente, hints diminuem a recompensa da questão.
            // Mas aqui estamos deduzindo do totalScore global (se existir).
            // E também do saldo (balance).
            const newScore = Math.max(0, (userData.totalScore || 0) - cost);
            const newBalance = Math.max(0, (userData.balance || 0) - cost);
            updateUserData?.({ totalScore: newScore, balance: newBalance });
        }
    }, [revealedHints, saveUsedHints, userData, updateUserData]);

    const getFinalScore = useCallback(() => {
        let score = calculateScore(question);
        if (hintsCost > 0) {
            score = Math.max(1, score - Math.floor(hintsCost / 2));
        }
        if (activePowerUp === 'double_stars') {
            score *= 2;
        }
        return score;
    }, [question, hintsCost, activePowerUp]);

    const handleAnswer = useCallback((correct: boolean) => {
        setIsCorrect(correct);
        setShowResult(true);
        setShowHints(false);
        mascotReact(correct);

        if (correct) {
            import('canvas-confetti').then((confettiModule) => {
                const confetti = (
                    'default' in confettiModule
                        ? confettiModule.default
                        : confettiModule
                ) as ConfettiFn;
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
                });
            });
            playSound('success');
        } else {
            playSound('error');
        }

        // Calcula score para onComplete (sem double_stars, pois GamePage gerencia isso)
        // Mas com desconto de dicas
        let score = correct ? calculateScore(question) : 0;
        if (correct && hintsCost > 0) {
            score = Math.max(1, score - Math.floor(hintsCost / 2));
        }
        onComplete(correct, score);
    }, [setIsCorrect, setShowResult, setShowHints, mascotReact, question, onComplete, hintsCost]);

    const handleRetry = useCallback(() => {
        setShowResult(false);
        setIsCorrect(false);
        onRetry?.();
    }, [onRetry]);

    const handleNext = useCallback(() => {
        setShowResult(false);
        setIsCorrect(false);
        setShowHints(false);
        setRevealedHints([]);
        setHintsCost(0);
        onNext();
    }, [onNext]);

    const handleBossRun = useCallback(async (code: string) => {
        try {
            return await runPython(code, question.tests);
        } catch (error) {
            return {
                stdout: '',
                stderr: String(error),
                hasError: true,
                allTestsPassed: false
            };
        }
    }, [runPython, question.tests]);

    const handleBossComplete = useCallback((score: number) => {
        onComplete(true, score);
    }, [onComplete]);

    return {
        showResult,
        isCorrect,
        showHints,
        setShowHints,
        effectiveShowHints,
        revealedHints,
        hintsCost,
        handleHintRevealed,
        getFinalScore,
        handleAnswer,
        handleRetry,
        handleNext,
        handleBossRun,
        handleBossComplete,
        isExecuting,
    };
}
