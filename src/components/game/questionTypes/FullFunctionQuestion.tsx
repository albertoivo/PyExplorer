import { useState } from 'react';
import type { QuestionDocument } from '../../../types/question';
import { usePyodide } from '../../../hooks/usePyodide';
import PythonEditor from '../../editor/PythonEditor';
import './QuestionTypes.css';

interface FullFunctionQuestionProps {
    question: QuestionDocument;
    onAnswer: (isCorrect: boolean, code: string) => void;
    disabled?: boolean;
    showResult?: boolean;
}

/**
 * Componente para questões de escrever função completa
 */
export function FullFunctionQuestion({
    question,
    onAnswer,
    disabled = false,
    showResult = false,
}: FullFunctionQuestionProps) {
    const [code, setCode] = useState(question.starterCode || '');
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string>('');
    const [testsPassed, setTestsPassed] = useState<number>(0);
    const [totalTests, setTotalTests] = useState<number>(0);
    const { runPython, ready } = usePyodide();

    const handleSubmit = async () => {
        if (disabled || !ready) return;

        setIsRunning(true);
        setOutput('');

        try {
            const result = await runPython(code, question.tests, question.functionName);

            if (result.hasError) {
                setOutput(result.stderr);
                setTestsPassed(0);
                setTotalTests(question.tests?.length || 0);
                onAnswer(false, code);
            } else {
                const allPassed = result.allTestsPassed ?? false;
                const passed = result.testResults?.filter(t => t.passed).length || 0;
                const total = result.testResults?.length || 0;

                setTestsPassed(passed);
                setTotalTests(total);

                let outputText = result.stdout || '';
                if (result.testResults) {
                    outputText += '\n\n📊 Resultados dos Testes:\n';
                    outputText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                    result.testResults.forEach((test, i) => {
                        const icon = test.passed ? '✅' : '❌';
                        outputText += `\n${icon} Teste ${i + 1}:\n`;
                        outputText += `   📥 Entrada: ${JSON.stringify(test.input)}\n`;
                        outputText += `   📤 Esperado: ${JSON.stringify(test.expectedOutput)}\n`;
                        if (!test.passed) {
                            outputText += `   ❌ Obtido: ${JSON.stringify(test.actualOutput)}\n`;
                            if (test.error) {
                                outputText += `   ⚠️ Erro: ${test.error}\n`;
                            }
                        }
                    });
                    outputText += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                    outputText += `📈 Resultado Final: ${passed}/${total} testes passaram!\n`;
                }

                setOutput(outputText);
                onAnswer(allPassed, code);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            setOutput(`❌ Erro: ${message}`);
            setTestsPassed(0);
            setTotalTests(question.tests?.length || 0);
            onAnswer(false, code);
        } finally {
            setIsRunning(false);
        }
    };

    const handleRun = async () => {
        if (!ready) return;

        setIsRunning(true);
        setOutput('');

        try {
            // Apenas executa o código sem verificar testes
            const result = await runPython(code);

            if (result.hasError) {
                setOutput(result.stderr);
            } else {
                setOutput(result.stdout || '(Nenhuma saída)');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            setOutput(`❌ Erro: ${message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="question-container question-container--code">
            <div className="question-header">
                <span className="question-type-badge question-type-badge--full">
                    💻 Escreva a Função
                </span>
                <span className={`question-difficulty question-difficulty--${question.difficulty}`}>
                    {question.difficulty === 'easy' && '⭐ Fácil'}
                    {question.difficulty === 'medium' && '⭐⭐ Médio'}
                    {question.difficulty === 'hard' && '⭐⭐⭐ Difícil'}
                </span>
            </div>

            <h2 className="question-title">{question.title}</h2>
            <p className="question-prompt">{question.prompt}</p>

            {question.functionName && (
                <div className="question-function-signature">
                    <span className="question-function-label">📝 Sua função deve se chamar:</span>
                    <code className="question-function-name">{question.functionName}</code>
                </div>
            )}

            {question.tests && question.tests.length > 0 && (
                <div className="question-examples">
                    <div className="question-examples__title">📋 Exemplos de uso:</div>
                    <div className="question-examples__list">
                        {question.tests.slice(0, 2).map((test, i) => (
                            <div key={i} className="question-example">
                                <code>
                                    {question.functionName}({JSON.stringify(test.input)})
                                    → {JSON.stringify(test.expectedOutput)}
                                </code>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="question-editor-container">
                <div className="question-editor-header">
                    <span>🐍 Editor Python</span>
                    {!ready && <span className="editor-loading">Carregando Python...</span>}
                    {totalTests > 0 && (
                        <span className={`editor-tests-badge ${testsPassed === totalTests ? 'editor-tests-badge--passed' : ''}`}>
                            {testsPassed}/{totalTests} testes
                        </span>
                    )}
                </div>
                <PythonEditor
                    code={code}
                    onChange={setCode}
                    disabled={disabled || !ready}
                    height="300px"
                />
            </div>

            {output && (
                <div className={`question-output ${showResult ? 'question-output--result' : ''}`}>
                    <div className="question-output__header">📤 Saída:</div>
                    <pre className="question-output__content">{output}</pre>
                </div>
            )}

            {!showResult && (
                <div className="question-actions">
                    <button
                        className="question-run-btn"
                        onClick={handleRun}
                        disabled={!ready || isRunning}
                    >
                        ▶ Testar Código
                    </button>
                    <button
                        className="question-submit-btn"
                        onClick={handleSubmit}
                        disabled={disabled || !ready || isRunning}
                    >
                        {isRunning ? 'Executando... ⏳' : 'Verificar Resposta 🚀'}
                    </button>
                </div>
            )}
        </div>
    );
}

