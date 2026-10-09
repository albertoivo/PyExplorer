import { useCallback } from 'react';
import type { UserProgress, UserAnswer, Difficulty, UserData } from '../../types/question';
import { updateProgress } from '../../firebase/firestore';
import { calculateAttemptResult } from '../../utils/progressLogic';
import { GUEST_PROGRESS_KEY } from './useProgressStore';

interface UseProgressActionsProps {
    userData: UserData | null;
    isGuest: boolean;
    updateUserData: (updates: Partial<UserData>) => Promise<void>;
    refreshUserData: () => Promise<void>;
    allProgress: UserProgress[];
    setAllProgress: React.Dispatch<React.SetStateAction<UserProgress[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    loadAllProgress: () => Promise<void>;
}

export function useProgressActions({
    userData,
    isGuest,
    updateUserData,
    refreshUserData,
    allProgress,
    setAllProgress,
    setError,
    loadAllProgress
}: UseProgressActionsProps) {

    const recordAttempt = useCallback(async (
        questionId: string,
        passed: boolean,
        score: number = 0,
        userAnswer?: UserAnswer,
        difficulty?: Difficulty,
        responseTimeSeconds?: number
    ): Promise<void> => {
        if (!userData && !isGuest) {
            return;
        }

        try {
            const existing = allProgress.find(p => p.questionId === questionId);
            const { newProgress, additionalScore } = calculateAttemptResult(
                userData?.uid || 'guest',
                questionId,
                existing,
                passed,
                score,
                userAnswer,
                difficulty,
                responseTimeSeconds
            );

            // Atualização otimista da UI (imediata)
            const updatedProgress = allProgress.filter(p => p.questionId !== questionId);
            updatedProgress.push(newProgress);
            setAllProgress(updatedProgress);

            // Atualiza o score total na UI imediatamente
            // Só atualiza score se tiver usuário
            if (additionalScore > 0 && userData) {
                const newTotalScore = (userData.totalScore || 0) + additionalScore;
                const newBalance = (userData.balance || 0) + additionalScore;
                await updateUserData({ totalScore: newTotalScore, balance: newBalance });
            }

            if (isGuest) {
                // Salva no localStorage para convidados
                localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(updatedProgress));
            } else {
                if (userData) {
                    // Salva no Firestore para usuários autenticados
                    await updateProgress(userData.uid, questionId, passed, score, userAnswer, newProgress.stars, newProgress.bestTimeSeconds);

                    // Recarrega dados do usuário para garantir sincronização
                    await refreshUserData();

                    // Recarrega progresso do Firestore para garantir sincronização completa
                    await loadAllProgress();
                }
            }
        } catch (err) {
            console.error('Erro ao salvar progresso:', err);
            // Em caso de erro, recarrega para ter o estado correto
            await loadAllProgress();

            // Define o erro DEPOIS de recarregar (pois loadAllProgress limpa o erro)
            const message = err instanceof Error ? err.message : 'Erro ao salvar progresso';
            setError(message);
        }
    }, [userData, isGuest, allProgress, loadAllProgress, updateUserData, refreshUserData, setAllProgress, setError]);

    return { recordAttempt };
}
