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

interface FillCodeQuestionProps {
    question: QuestionDocument;
    onAnswer: (isCorrect: boolean, code: string) => void;
    disabled?: boolean;
    showResult?: boolean;
}

/**
 * Componente para questões de completar código
 */
export function FillCodeQuestion({
    question,
    onAnswer,
    disabled = false,
    showResult = false,
}: FillCodeQuestionProps) {
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

    const handleSubmit = async () => {
        if (!beginCodeExecution(disabled, ready, setIsRunning, setOutput)) return;

        try {
            const result = await runCodeQuestionTests(runPython, code, question);

            if ((result as { hasError: boolean }).hasError) {
                setOutput((result as { stderr: string }).stderr);
                onAnswer(false, code);
            } else {
                const typedResult = result as {
                    allTestsPassed?: boolean;
                    stdout?: string;
                    testResults?: Array<{
                        passed: boolean;
                        expectedOutput?: unknown;
                        actualOutput?: unknown;
                    }>;
                };
                const allPassed = typedResult.allTestsPassed ?? false;

                let outputText = typedResult.stdout || '';
                if (typedResult.testResults) {
                    outputText += '\n\n📊 Resultados dos Testes:\n';
                    typedResult.testResults.forEach((test, i) => {
                        const icon = test.passed ? '✅' : '❌';
                        outputText += `${icon} Teste ${i + 1}: ${test.passed ? 'Passou!' : 'Falhou'}\n`;
                        if (!test.passed) {
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
                badgeClassName="question-type-badge--code"
                badgeText={t('questionTypes.badgeFill', '✏️ Complete o Código')}
                difficulty={question.difficulty}
                title={question.title}
                prompt={question.prompt}
            />

            <div className="question-editor-container">
                <div className="question-editor-header">
                    <span>{t('question.editorPython', '🐍 Editor Python')}</span>
                    {!ready && <span className="editor-loading">{t('question.loadingPython', 'Carregando Python...')}</span>}
                </div>
                <PythonEditor
                    code={code}
                    onChange={setCode}
                    disabled={disabled || !ready}
                    height="200px"
                />
            </div>

            {output && (
                <div className={`question-output ${showResult ? 'question-output--result' : ''}`}>
                    <div className="question-output__header">{t('tutorials.output', '📤 Saída:')}</div>
                    <pre className="question-output__content">{output}</pre>
                </div>
            )}

            {!showResult && (
                <button
                    className="question-submit-btn"
                    onClick={handleSubmit}
                    disabled={disabled || !ready || isRunning}
                >
                    {isRunning ? t('question.checking', 'Verificando...') : t('question.checkAnswer', 'Verificar Resposta 🚀')}
                </button>
            )}
        </div>
    );
}
