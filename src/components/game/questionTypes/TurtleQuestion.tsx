
import { useState, useEffect, memo } from 'react';
import type { QuestionDocument } from '../../../types/question';
import { usePyodide } from '../../../hooks/usePyodide';
import PythonEditor from '../../editor/PythonEditor';
import TurtleCanvas from '../turtle/TurtleCanvas';
import { TURTLE_PYTHON_SHIM } from '../turtle/turtle-python-shim';
import { runTurtleSimulation, compareTurtlePaths } from '../../../utils/turtleValidation';
import { QuestionHeader } from './QuestionTypeShared';
import './QuestionTypes.css';
import './TurtleQuestion.css';

interface TurtleQuestionProps {
    question: QuestionDocument;
    onAnswer: (isCorrect: boolean, code: string) => void;
    disabled?: boolean;
    showResult?: boolean;
}

export const TurtleQuestion = memo(function TurtleQuestion({
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
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(message);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsRunning(true);
        setError(null);
        if (window.turtle_reset) window.turtle_reset();

        try {
            // 1. Run user code for visual feedback
            // This runs via the shim hook into TurtleCanvas
            await new Promise(r => setTimeout(r, 100));
            const result = await runPython(code);

            if (result.hasError) {
                setError(result.stderr);
                onAnswer(false, code);
                return;
            }

            // 2. Validate drawing if solutionCode is present
            if (question.solutionCode) {
                // Run user code AGAIN in simulation mode to capture segments synchronously
                // This avoids race conditions with the visual canvas animation
                const userSegments = await runTurtleSimulation(runPython, code);

                // Calculate expected segments using headless simulation
                const expectedSegments = await runTurtleSimulation(runPython, question.solutionCode);

                const isMatch = compareTurtlePaths(userSegments, expectedSegments);

                if (isMatch) {
                     onAnswer(true, code);
                } else {
                    setError('O desenho não ficou igual ao esperado. Tente novamente! 🐢');
                    onAnswer(false, code);
                }
            } else {
                // Fallback for older questions or if no solution provided
                onAnswer(true, code);
            }

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(message);
            onAnswer(false, code);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="question-container question-container--turtle">
            <QuestionHeader
                badgeClassName="question-type-badge--turtle"
                badgeText="🐢 Desenho com Tartaruga"
                difficulty={question.difficulty}
                title={question.title}
                prompt={question.prompt}
            />

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
});

