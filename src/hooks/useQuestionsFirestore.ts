import { useState, useEffect, useCallback, useMemo } from 'react';
import type { QuestionDocument, World } from '../types/question';
import { fetchAllQuestions, seedQuestions } from '../firebase/questionsService';

/**
 * Hook para gerenciar questões do Firestore
 * Carrega questões do Firestore com fallback automático para dados locais
 */
export function useQuestionsFirestore() {
    const [questions, setQuestions] = useState<QuestionDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [source, setSource] = useState<'firestore' | 'local' | 'loading'>('loading');

    /**
     * Carrega todas as questões
     */
    const loadQuestions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchAllQuestions();
            setQuestions(data);
            // Se temos dados, determina a fonte (Firestore não lança erro se vazio)
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
     * Popula o Firestore com as questões mock (run once)
     */
    const runSeed = useCallback(async () => {
        const result = await seedQuestions();
        if (result.success) {
            await loadQuestions(); // Recarrega após seed
        }
        return result;
    }, [loadQuestions]);

    // Carrega questões na montagem do componente
    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    /**
     * Filtra questões por mundo
     */
    const getQuestionsByWorld = useCallback((world: World): QuestionDocument[] => {
        return questions.filter(q => q.world === world);
    }, [questions]);

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
        seed: runSeed,
    };
}
