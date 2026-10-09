import { useState, useCallback, useMemo } from 'react';
import type { UserProgress, UserData } from '../../types/question';
import { getUserProgress } from '../../firebase/firestore';

export const GUEST_PROGRESS_KEY = 'pyexplorer_guest_progress';

interface UseProgressStoreProps {
    userData: UserData | null;
    isGuest: boolean;
}

export function useProgressStore({ userData, isGuest }: UseProgressStoreProps) {
    const [allProgress, setAllProgress] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAllProgress = useCallback(async () => {
        // Se não tem usuário e não é convidado, não carrega nada
        if (!userData && !isGuest) {
            setAllProgress([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isGuest) {
                // Carrega do localStorage para convidados
                const stored = localStorage.getItem(GUEST_PROGRESS_KEY);
                if (stored) {
                    setAllProgress(JSON.parse(stored));
                } else {
                    setAllProgress([]);
                }
            } else {
                // Carrega do Firestore para usuários autenticados
                if (userData) {
                    const data = await getUserProgress(userData.uid);
                    setAllProgress(data);
                }
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar progresso';
            setError(message);
            console.error('Erro ao carregar progresso:', err);
        } finally {
            setLoading(false);
        }
    }, [userData, isGuest]);

    /**
     * Optimization: Map for O(1) access to progress by ID.
     * Replaces O(N) linear search that occurred inside render loops.
     */
    const progressMap = useMemo(() => {
        return new Map(allProgress.map(p => [p.questionId, p]));
    }, [allProgress]);

    return {
        allProgress,
        setAllProgress,
        loading,
        error,
        setError,
        loadAllProgress,
        progressMap
    };
}
