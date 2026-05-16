import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useMemo, useCallback } from 'react';
import { categorizePythonError } from '../../utils/errorTranslations';
import './PythonEditor.css';

interface PythonEditorProps {
    /** Código atual no editor */
    code: string;
    /** Callback quando o código muda */
    onChange: (code: string) => void;
    /** Se o editor está desabilitado */
    disabled?: boolean;
    /** Altura do editor */
    height?: string;
    /** Theme do editor */
    theme?: 'dark' | 'light';
    /** ID da questão para telemetria */
    questionId?: string;
    /** Erro atual de execução (se houver) */
    error?: string;
    /** Se a execução atual foi um sucesso */
    isSuccess?: boolean;
}

export function useEducationalAnalytics(questionId?: string) {
    const metricsRef = useRef({
        questionId,
        startTime: 0,
        errorCounts: {} as Record<string, number>,
    });

    useEffect(() => {
        metricsRef.current = {
            questionId,
            startTime: Date.now(),
            errorCounts: {},
        };
    }, [questionId]);

    const logError = useCallback((errorMessage: string) => {
        if (!questionId) return;
        const normalizedError = categorizePythonError(errorMessage);
        
        metricsRef.current.errorCounts[normalizedError] = 
            (metricsRef.current.errorCounts[normalizedError] || 0) + 1;
            
        console.log(`[Educational Telemetry] Error logged for ${questionId}:`, {
            errorType: normalizedError,
            count: metricsRef.current.errorCounts[normalizedError],
            fullMessage: errorMessage
        });
        
        if (metricsRef.current.errorCounts[normalizedError] >= 3) {
            console.warn(`[Educational Telemetry] FRUSTRATION DETECTED: User hit '${normalizedError}' 3+ times.`);
        }
    }, [questionId]);

    const logSuccess = useCallback(() => {
        if (!questionId) return;
        const timeSpentSeconds = Math.round((Date.now() - metricsRef.current.startTime) / 1000);
        
        console.log(`[Educational Telemetry] Question ${questionId} completed:`, {
            timeSpentSeconds,
            errorSummary: metricsRef.current.errorCounts
        });
    }, [questionId]);

    return { logError, logSuccess };
}

/**
 * Editor de código Python com syntax highlighting
 * Baseado no Monaco Editor (mesmo usado no VS Code)
 */
export function PythonEditor({
    code,
    onChange,
    disabled = false,
    height = '300px',
    theme = 'dark',
    questionId,
    error,
    isSuccess
}: PythonEditorProps) {
    const analytics = useEducationalAnalytics(questionId);

    // Track errors when they change
    useEffect(() => {
        if (error) {
            analytics.logError(error);
        }
    }, [error, analytics]);

    // Track success
    useEffect(() => {
        if (isSuccess) {
            analytics.logSuccess();
        }
    }, [isSuccess, analytics]);

    const handleChange = useCallback((value: string | undefined) => {
        if (!disabled && value !== undefined) {
            onChange(value);
        }
    }, [disabled, onChange]);

    // Configurações do Monaco Editor
    const editorOptions = useMemo(() => ({
        minimap: { enabled: false },
        fontSize: 16,
        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
        fontLigatures: true,
        lineNumbers: 'on' as const,
        roundedSelection: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        wordWrap: 'on' as const,
        padding: { top: 16, bottom: 16 },
        scrollbar: {
            vertical: 'auto' as const,
            horizontal: 'auto' as const,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
        },
        readOnly: disabled,
        // Configurações amigáveis para iniciantes
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        parameterHints: { enabled: true },
        bracketPairColorization: { enabled: true },
    }), [disabled]);

    return (
        <div className={`python-editor ${disabled ? 'python-editor--disabled' : ''}`}>
            <Editor
                height={height}
                language="python"
                value={code}
                onChange={handleChange}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={editorOptions}
                loading={
                    <div className="python-editor__loading">
                        <div className="python-editor__loading-spinner"></div>
                        <span>Carregando editor...</span>
                    </div>
                }
            />
        </div>
    );
}

export default PythonEditor;
