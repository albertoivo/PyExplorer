import type { QuestionDocument } from '../../../types/question';
import PythonEditor from '../../editor/PythonEditor';
import { QuestionHeader } from './QuestionTypeShared';
import {
    beginCodeExecution,
    runCodeQuestionTests,
    useCodeQuestionRuntime,
} from './QuestionTypeRuntime';
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
                }>;
            };

            if (typedResult.hasError) {
                setOutput(typedResult.stderr || 'Erro desconhecido');
                onAnswer(false, code);
            } else {
                const allPassed = typedResult.allTestsPassed ?? false;

                let outputText = typedResult.stdout || '';
                if (typedResult.testResults) {
                    outputText += '\n\n📊 Resultados dos Testes:\n';
                    typedResult.testResults.forEach((test, i) => {
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
            <QuestionHeader
                badgeClassName="question-type-badge--partial"
                badgeText="🧩 Complete a Função"
                difficulty={question.difficulty}
                title={question.title}
                prompt={question.prompt}
            />

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

