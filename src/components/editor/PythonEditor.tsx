import { lazy, Suspense } from 'react';
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

const LazyPythonEditorComponent = lazy(() => import('./PythonEditorComponent'));

function PythonEditor(props: PythonEditorProps) {
    return (
        <Suspense fallback={
            <div className={`python-editor ${props.disabled ? 'python-editor--disabled' : ''}`} style={{ height: props.height || '300px' }}>
                <div className="python-editor__loading">
                    <div className="python-editor__loading-spinner"></div>
                    <span>Carregando editor...</span>
                </div>
            </div>
        }>
            <LazyPythonEditorComponent {...props} />
        </Suspense>
    );
}

export default PythonEditor;
