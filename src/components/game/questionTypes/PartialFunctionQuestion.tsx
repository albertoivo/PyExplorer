import { useState } from 'react';
import type { QuestionDocument } from '../../../types/question';
import { usePyodide } from '../../../hooks/usePyodide';
import PythonEditor from '../../editor/PythonEditor';
import './QuestionTypes.css';

interface PartialFunctionQuestionProps {
    question: QuestionDocument;
    onAnswer: (isCorrect: boolean, code: string) => void;
    disabled?: boolean;
    showResult?: boolean;
}

/**
 * Componente para questões de completar parte de uma função
 */
export function PartialFunctionQuestion({
    question,
    onAnswer,
    disabled = false,
    showResult = false,
}: PartialFunctionQuestionProps) {
    const [code, setCode] = useState(question.starterCode || '');
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string>('');
    const { runPython, ready } = usePyodide();

    const handleSubmit = async () => {
        if (disabled || !ready) return;

        setIsRunning(true);
        setOutput('');

        try {
            const result = await runPython(code, question.tests, question.functionName);

            if (result.hasError) {
                setOutput(result.stderr);
                onAnswer(false, code);
            } else {
                const allPassed = result.allTestsPassed ?? false;

                let outputText = result.stdout || '';
                if (result.testResults) {
                    outputText += '\n\n📊 Resultados dos Testes:\n';
                    result.testResults.forEach((test, i) => {
                        const icon = test.passed ? '✅' : '❌';
                        outputText += `${icon} Teste ${i + 1}: ${test.passed ? 'Passou!' : 'Falhou'}\n`;
                        if (!test.passed) {
                            outputText += `   Entrada: ${JSON.stringify(test.input)}\n`;
                            outputText += `   Esperado: ${JSON.stringify(test.expectedOutput)}\n`;
                            outputText += `   Obtido: ${JSON.stringify(test.actualOutput)}\n`;
                        }
                    });
                }

                setOutput(outputText);
                onAnswer(allPassed, code);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            setOutput(`❌ Erro: ${message}`);
            onAnswer(false, code);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="question-container question-container--code">
            <div className="question-header">
                <span className="question-type-badge question-type-badge--partial">
                    🧩 Complete a Função
                </span>
                <span className={`question-difficulty question-difficulty--${question.difficulty}`}>
                    {question.difficulty === 'easy' && '⭐ Fácil'}
                    {question.difficulty === 'medium' && '⭐⭐ Médio'}
                    {question.difficulty === 'hard' && '⭐⭐⭐ Difícil'}
                </span>
            </div>

            <h2 className="question-title">{question.title}</h2>
            <p className="question-prompt">{question.prompt}</p>

            <div className="question-hint">
                💡 <strong>Dica:</strong> Complete apenas as partes faltantes do código.
                O resto já está pronto para você!
            </div>

            <div className="question-editor-container">
                <div className="question-editor-header">
                    <span>🐍 Editor Python</span>
                    {!ready && <span className="editor-loading">Carregando Python...</span>}
                </div>
                <PythonEditor
                    code={code}
                    onChange={setCode}
                    disabled={disabled || !ready}
                    height="250px"
                />
            </div>

            {output && (
                <div className={`question-output ${showResult ? 'question-output--result' : ''}`}>
                    <div className="question-output__header">📤 Saída:</div>
                    <pre className="question-output__content">{output}</pre>
                </div>
            )}

            {!showResult && (
                <button
                    className="question-submit-btn"
                    onClick={handleSubmit}
                    disabled={disabled || !ready || isRunning}
                >
                    {isRunning ? 'Executando... ⏳' : 'Executar e Verificar 🚀'}
                </button>
            )}
        </div>
    );
}

export default PartialFunctionQuestion;
