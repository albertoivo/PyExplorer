import { useState } from 'react';
import type { QuestionDocument } from '../../../types/question';
import PythonEditor from '../../editor/PythonEditor';
import { QuestionHeader } from './QuestionTypeShared';
import {
    beginCodeExecution,
    runCodeQuestionTests,
    useCodeQuestionRuntime,
} from './QuestionTypeRuntime';
import { useTranslation } from 'react-i18next';
import './QuestionTypes.css';

function formatTestInputArgs(input: unknown): string {
    if (Array.isArray(input)) {
        return input.map(arg => JSON.stringify(arg)).join(', ');
    }
    if (input === undefined || input === null) {
        return '';
    }
    return JSON.stringify(input);
}

interface FullFunctionQuestionProps {
    question: QuestionDocument;
    onAnswer: (isCorrect: boolean, code: string) => void;
    disabled?: boolean;
    showResult?: boolean;
}

/**
 * Componente para questões onde o usuário escreve a função completa do zero
 */
export function FullFunctionQuestion({
    question,
    onAnswer,
    disabled = false,
    showResult = false,
}: FullFunctionQuestionProps) {
    const { t } = useTranslation('game');
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

            if ((result as { hasError: boolean }).hasError) {
                setOutput((result as { stderr: string }).stderr);
                setTestsPassed(0);
                setTotalTests(question.tests?.length || 0);
                onAnswer(false, code);
            } else {
                const typedResult = result as {
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
                const allPassed = typedResult.allTestsPassed ?? false;
                const passed = typedResult.testResults?.filter(t => t.passed).length || 0;
                const total = typedResult.testResults?.length || question.tests?.length || 0;

                setTestsPassed(passed);
                setTotalTests(total);

                let outputText = typedResult.stdout || '';
                if (typedResult.testResults) {
                    outputText += '\n\n📊 Resultados dos Testes:\n';
                    outputText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                    typedResult.testResults.forEach((test, i) => {
                        const icon = test.passed ? '✅' : '❌';
                        outputText += `\n${icon} Teste ${i + 1}:\n`;
                        outputText += `   📥 Entrada: ${formatTestInputArgs(test.input)}\n`;
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
            // Se o usuário não chamou a função explicitamente no código, adiciona um exemplo de chamada de teste
            let codeToRun = code;
            if (question.functionName && question.tests && question.tests.length > 0 && !code.includes(`${question.functionName}(`)) {
                const firstTest = question.tests[0];
                const argsStr = formatTestInputArgs(firstTest.input);
                codeToRun = `${code}\n\n# Exemplo de teste executado:\nprint(${question.functionName}(${argsStr}))`;
            }

            const result = await runPython(codeToRun);

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
                badgeText={t('questionTypes.badgeFull', '⚡ Ecreva a Função')}
                difficulty={question.difficulty}
                title={question.title}
                prompt={question.prompt}
            />

            {question.functionName && (
                <div className="question-function-signature">
                    <span className="question-function-label">{t('question.functionMustBeNamed', '📝 Sua função deve se chamar:')}</span>
                    <code className="question-function-name">{question.functionName}</code>
                </div>
            )}

            {question.tests && question.tests.length > 0 && (
                <div className="question-examples">
                    <div className="question-examples__title">{t('question.usageExamples', '📋 Exemplos de uso:')}</div>
                    <div className="question-examples__list">
                        {question.tests.slice(0, 2).map((test, i) => (
                            <div key={i} className="question-example">
                                <code>
                                    {question.functionName}({formatTestInputArgs(test.input)})
                                    → {JSON.stringify(test.expectedOutput)}
                                </code>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="question-editor-container">
                <div className="question-editor-header">
                    <span>{t('question.editorPython', '🐍 Editor Python')}</span>
                    {!ready && <span className="editor-loading">{t('question.loadingPython', 'Carregando Python...')}</span>}
                    {totalTests > 0 && (
                        <span className={`editor-tests-badge ${testsPassed === totalTests ? 'editor-tests-badge--passed' : ''}`}>
                            {testsPassed}/{totalTests} {t('sagaBanner.questions', 'testes')}
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
                    <div className="question-output__header">{t('tutorials.output', '📤 Saída:')}</div>
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
                        {t('question.runCode', '▶️ Executar')}
                    </button>
                    <button
                        className="question-submit-btn"
                        onClick={handleSubmit}
                        disabled={disabled || !ready || isRunning}
                    >
                        {isRunning ? t('question.checking', 'Verificando...') : t('question.checkAnswer', 'Verificar Resposta 🚀')}
                    </button>
                </div>
            )}
        </div>
    );
}
