import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { TestCase, PythonExecutionResult } from '../types/question';
import type { PyodideInterface } from '../utils/pyodide/types';
import { loadPyodideInstance } from '../utils/pyodide/loader';
import { runPythonCode } from '../utils/pyodide/runner';

/**
 * Interface para o contexto do Pyodide
 */
interface PyodideContextType {
    /** Se o Pyodide está pronto para uso */
    ready: boolean;
    /** Se está carregando o Pyodide inicialmente */
    loading: boolean;
    /** Se está executando código Python */
    executing: boolean;
    /** Erro de carregamento, se houver */
    error: string | null;
    /** Progresso de carregamento (0-100) */
    loadingProgress: number;
    /** Executa código Python */
    runPython: (code: string, tests?: TestCase[], functionName?: string) => Promise<PythonExecutionResult>;
    /** Carrega o Pyodide sob demanda */
    loadPyodide: () => Promise<void>;
}

const PyodideContext = createContext<PyodideContextType | undefined>(undefined);

interface PyodideProviderProps {
    children: ReactNode;
}

/**
 * Provider que carrega e disponibiliza o Pyodide para toda a aplicação
 */
export function PyodideProvider({ children }: PyodideProviderProps) {
    const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const loadPyodide = useCallback(async () => {
        if (ready || loading) return;

        try {
            setLoading(true);
            const pyodideInstance = await loadPyodideInstance(setLoadingProgress);

            setPyodide(pyodideInstance);
            setReady(true);
            setLoading(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar Pyodide';
            console.error('❌ Erro ao carregar Pyodide:', err);
            setError(message);
            setLoading(false);
        }
    }, [ready, loading]);

    /**
     * Executa código Python e retorna resultado
     */
    const runPython = useCallback(async (
        code: string,
        tests?: TestCase[],
        functionName?: string
    ): Promise<PythonExecutionResult> => {
        setExecuting(true);
        try {
            return await runPythonCode(pyodide, ready, code, tests, functionName);
        } finally {
            setExecuting(false);
        }
    }, [pyodide, ready]);

    const value = useMemo<PyodideContextType>(() => ({
        ready,
        loading,
        executing,
        error,
        loadingProgress,
        runPython,
        loadPyodide,
    }), [ready, loading, executing, error, loadingProgress, runPython, loadPyodide]);

    return (
        <PyodideContext.Provider value={value}>
            {children}
        </PyodideContext.Provider>
    );
}

/**
 * Hook para acessar o contexto do Pyodide
 */
// eslint-disable-next-line react-refresh/only-export-components
export function usePyodide(): PyodideContextType {
    const context = useContext(PyodideContext);
    if (context === undefined) {
        throw new Error('usePyodide deve ser usado dentro de um PyodideProvider');
    }
    return context;
}
