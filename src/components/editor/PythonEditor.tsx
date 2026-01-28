import Editor from '@monaco-editor/react';
import { useMemo, useCallback, memo } from 'react';
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
}

/**
 * Editor de código Python com syntax highlighting
 * Baseado no Monaco Editor (mesmo usado no VS Code)
 */
const PythonEditorBase = ({
    code,
    onChange,
    disabled = false,
    height = '300px',
    theme = 'dark',
}: PythonEditorProps) => {
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
};

// Optimized with React.memo to prevent unnecessary re-renders of the heavy Monaco Editor instance
// when parent state changes (e.g. timers, progress updates) but editor props remain stable.
export const PythonEditor = memo(PythonEditorBase);
export default PythonEditor;
