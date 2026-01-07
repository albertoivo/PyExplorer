
import { useState, useEffect } from 'react';
import type { QuestionDocument } from '../../../types/question';
import { usePyodide } from '../../../hooks/usePyodide';
import PythonEditor from '../../editor/PythonEditor';
import TurtleCanvas from '../turtle/TurtleCanvas';
import { TURTLE_PYTHON_SHIM } from '../turtle/turtle-python-shim';
import './QuestionTypes.css';
import './TurtleQuestion.css';

interface TurtleQuestionProps {
    question: QuestionDocument;
    onAnswer: (isCorrect: boolean, code: string) => void;
    disabled?: boolean;
    showResult?: boolean;
}

export function TurtleQuestion({
    question,
    onAnswer,
    disabled = false,
    showResult = false,
}: TurtleQuestionProps) {
    const [code, setCode] = useState(question.starterCode || '');
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { runPython, ready } = usePyodide();

    // Injeta o shim do Turtle no Pyodide assim que estiver pronto
    useEffect(() => {
        if (ready) {
            runPython(TURTLE_PYTHON_SHIM).catch(console.error);
        }
    }, [ready, runPython]);

    const handleRun = async () => {
        if (!ready) return;

        setIsRunning(true);
        setError(null);

        // Reseta canvas visualmente
        if (window.turtle_reset) window.turtle_reset();

        try {
            // Executa código do usuário
            // Adiciona um pequeno delay para garantir que o reset ocorreu
            await new Promise(r => setTimeout(r, 100));

            const result = await runPython(code);

            if (result.hasError) {
                setError(result.stderr);
            }

            // Em desafios visuais, a validação automática é difícil.
            // Por enquanto, consideramos que se rodou sem erro, "passou" para fins de teste livre.
            // Para validação real, precisaríamos inspecionar o histórico de comandos da tartaruga.
            // Como melhoria futura: capturar o histórico de comandos e comparar com 'expectedPath'.

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(message);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        // Validação simples: se rodou sem erro, pergunta ao usuário se o desenho está igual.
        // Ou, idealmente, verifica o estado final da tartaruga.
        // Vamos implementar uma validação "Honestidade" + check simples de erro por enquanto,
        // mas o ideal é comparar o rastro.
        // Vou assumir correto se rodou sem erro.

        await handleRun();

        if (!error) {
            // TODO: Validação real do desenho.
            // Por simplificação neste MVP, se não deu erro de execução, consideramos sucesso.
            onAnswer(true, code);
        } else {
            onAnswer(false, code);
        }
    };

    return (
        <div className="question-container question-container--turtle">
            <div className="question-header">
                <span className="question-type-badge question-type-badge--turtle">
                    🐢 Desenho com Tartaruga
                </span>
                <span className={`question-difficulty question-difficulty--${question.difficulty}`}>
                    {question.difficulty === 'easy' && '⭐ Fácil'}
                    {question.difficulty === 'medium' && '⭐⭐ Médio'}
                    {question.difficulty === 'hard' && '⭐⭐⭐ Difícil'}
                </span>
            </div>

            <h2 className="question-title">{question.title}</h2>
            <p className="question-prompt">{question.prompt}</p>

            <div className="turtle-workspace">
                <div className="turtle-editor-section">
                    <div className="question-editor-header">
                        <span>🐍 Seu Código</span>
                    </div>
                    <PythonEditor
                        code={code}
                        onChange={setCode}
                        disabled={disabled || !ready}
                        height="400px"
                    />
                </div>

                <div className="turtle-canvas-section">
                    <div className="question-editor-header">
                        <span>🎨 Resultado</span>
                    </div>
                    <TurtleCanvas
                        width={400}
                        height={400}
                        backgroundImage={question.targetImage}
                    />
                </div>
            </div>

            {error && (
                <div className="question-output question-output--error">
                    <div className="question-output__header">❌ Ops, algo deu errado:</div>
                    <pre className="question-output__content">{error}</pre>
                </div>
            )}

            {!showResult && (
                <div className="question-actions">
                    <button
                        className="question-run-btn"
                        onClick={handleRun}
                        disabled={!ready || isRunning}
                    >
                        ▶ Testar Desenho
                    </button>
                    <button
                        className="question-submit-btn"
                        onClick={handleSubmit}
                        disabled={disabled || !ready || isRunning}
                    >
                        Meu desenho ficou legal! ✅
                    </button>
                </div>
            )}
        </div>
    );
}

export default TurtleQuestion;
