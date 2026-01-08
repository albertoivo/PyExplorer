import { useState, useEffect, useCallback } from 'react';
import type { QuestionDocument, World, Difficulty } from '../types/question';
import { getQuestions, getQuestion, getQuestionsByWorld } from '../firebase/firestore';

/**
 * Interface para filtros de questões
 */
interface QuestionFilters {
    world?: World;
    difficulty?: Difficulty;
    limitCount?: number;
}

/**
 * Hook para gerenciar questões
 */
export function useQuestions(filters?: QuestionFilters) {
    const [questions, setQuestions] = useState<QuestionDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Carrega questões com os filtros fornecidos
     */
    const loadQuestions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getQuestions(filters);
            setQuestions(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar questões';
            setError(message);
            console.error('Erro ao carregar questões:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters?.world, filters?.difficulty, filters?.limitCount]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    return {
        questions,
        loading,
        error,
        reload: loadQuestions,
    };
}

/**
 * Hook para buscar uma questão específica
 */
export function useQuestion(questionId: string | null) {
    const [question, setQuestion] = useState<QuestionDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!questionId) {
            setQuestion(null);
            setLoading(false);
            return;
        }

        async function loadQuestion() {
            setLoading(true);
            setError(null);
            try {
                const data = await getQuestion(questionId!);
                setQuestion(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Erro ao carregar questão';
                setError(message);
                console.error('Erro ao carregar questão:', err);
            } finally {
                setLoading(false);
            }
        }

        loadQuestion();
    }, [questionId]);

    return {
        question,
        loading,
        error,
    };
}

/**
 * Hook para buscar questões de um mundo específico
 */
export function useWorldQuestions(world: World | null) {
    const [questions, setQuestions] = useState<QuestionDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!world) {
            setQuestions([]);
            setLoading(false);
            return;
        }

        async function loadQuestions() {
            setLoading(true);
            setError(null);
            try {
                const data = await getQuestionsByWorld(world!);
                setQuestions(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Erro ao carregar questões do mundo';
                setError(message);
                console.error('Erro ao carregar questões do mundo:', err);
            } finally {
                setLoading(false);
            }
        }

        loadQuestions();
    }, [world]);

    return {
        questions,
        loading,
        error,
    };
}
