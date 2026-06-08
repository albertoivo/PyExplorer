import { useState } from 'react';
import type { QuestionDocument } from '../../../types/question';
import PythonEditor from '../../editor/PythonEditor';
import {
    beginCodeExecution,
    QuestionHeader,
    runCodeQuestionTests,
    useCodeQuestionRuntime,
} from './QuestionTypeShared';
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
    const {
        code,
        setCode,
        isRunning,
        setIsRunning,
        output,
        setOutput,
        runPython,
        ready,
    } = useCodeQuestionRuntime(question);
    const [testsPassed, setTestsPassed] = useState<number>(0);
    const [totalTests, setTotalTests] = useState<number>(0);

    const handleSubmit = async () => {
        if (!beginCodeExecution(disabled, ready, setIsRunning, setOutput)) return;

        try {
            const result = await runCodeQuestionTests(runPython, code, question);
            const typedResult = result as {
                hasError: boolean;
                stderr?: string;
                allTestsPassed?: boolean;
                stdout?: string;
                testResults?: Array<{
                    passed: boolean;
                    input?: unknown;
                    expectedOutput?: unknown;
                    actualOutput?: unknown;
                    error?: string;
                }>;
            };

            if (typedResult.hasError) {
                setOutput(typedResult.stderr || 'Erro desconhecido');
                setTestsPassed(0);
                setTotalTests(question.tests?.length || 0);
                onAnswer(false, code);
            } else {
                const allPassed = typedResult.allTestsPassed ?? false;
                const passed = typedResult.testResults?.filter(t => t.passed).length || 0;
                const total = typedResult.testResults?.length || 0;

                setTestsPassed(passed);
                setTotalTests(total);

                let outputText = typedResult.stdout || '';
                if (typedResult.testResults) {
                    outputText += '\n\n📊 Resultados dos Testes:\n';
                    outputText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                    typedResult.testResults.forEach((test, i) => {
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
            <QuestionHeader
                badgeClassName="question-type-badge--full"
                badgeText="💻 Escreva a Função"
                difficulty={question.difficulty}
                title={question.title}
                prompt={question.prompt}
            />

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

