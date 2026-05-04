import { useState, useEffect, useCallback, useMemo } from 'react';
import type { QuestionDocument, World } from '../types/question';
import { fetchAllQuestions, autoSyncQuestions } from '../firebase/questionsService';

/**
 * Hook para gerenciar questões do Firestore
 * Sincroniza automaticamente questões novas e carrega do Firestore
 */
export function useQuestionsFirestore() {
    const [questions, setQuestions] = useState<QuestionDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [source, setSource] = useState<'firestore' | 'local' | 'loading'>('loading');
    const [syncStatus, setSyncStatus] = useState<string | null>(null);

    /**
     * Carrega todas as questões (com auto-sync)
     */
    const loadQuestions = useCallback(async (doSync: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            // Auto-sync na primeira carga para garantir que novas questões apareçam
            if (doSync) {
                setSyncStatus('Sincronizando...');
                const syncResult = await autoSyncQuestions();
                if (syncResult.synced) {
                    setSyncStatus(`✅ ${syncResult.message}`);
                } else {
                    setSyncStatus(null); // Já sincronizado, não precisa mostrar
                }
            }

            const data = await fetchAllQuestions();
            setQuestions(data);
            setSource(data.length > 0 ? 'firestore' : 'local');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar questões';
            setError(message);
            console.error('Erro ao carregar questões:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Força re-sincronização
     */
    const resync = useCallback(async () => {
        await loadQuestions(true);
    }, [loadQuestions]);

    // Carrega questões na montagem do componente (com auto-sync)
    useEffect(() => {
        const initializeQuestions = async () => {
            await loadQuestions(true);
        };
        initializeQuestions();
    }, [loadQuestions]);

    /**
     * Agrupa questões por mundo
     */
    const questionsByWorld = useMemo(() => {
        const groups = new Map<World, QuestionDocument[]>();

        for (const question of questions) {
            const worldQuestions = groups.get(question.world) || [];
            worldQuestions.push(question);
            groups.set(question.world, worldQuestions);
        }

        return groups;
    }, [questions]);

    /**
     * Filtra questões por mundo
     * ⚡ O(1) lookup using cached map
     */
    const getQuestionsByWorld = useCallback((world: World): QuestionDocument[] => {
        return questionsByWorld.get(world) || [];
    }, [questionsByWorld]);

    /**
     * Lista de mundos disponíveis
     */
    const availableWorlds = useMemo(() => {
        return Array.from(new Set(questions.map(q => q.world)));
    }, [questions]);

    return {
        questions,
        loading,
        error,
        source,
        questionsByWorld,
        availableWorlds,
        getQuestionsByWorld,
        reload: loadQuestions,
        syncStatus,
        resync,
    };
}
