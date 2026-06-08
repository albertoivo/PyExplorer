import { useState } from 'react';
import type { QuestionDocument, Difficulty } from '../../../types/question';
import { usePyodide } from '../../../hooks/usePyodide';

interface QuestionHeaderProps {
    badgeClassName: string;
    badgeText: string;
    difficulty: Difficulty;
    title: string;
    prompt: string;
}

export function QuestionHeader({
    badgeClassName,
    badgeText,
    difficulty,
    title,
    prompt,
}: QuestionHeaderProps) {
    return (
        <>
            <div className="question-header">
                <span className={`question-type-badge ${badgeClassName}`}>
                    {badgeText}
                </span>
                <span className={`question-difficulty question-difficulty--${difficulty}`}>
                    {difficulty === 'easy' && '⭐ Fácil'}
                    {difficulty === 'medium' && '⭐⭐ Médio'}
                    {difficulty === 'hard' && '⭐⭐⭐ Difícil'}
                </span>
            </div>

            <h2 className="question-title">{title}</h2>
            <p className="question-prompt">{prompt}</p>
        </>
    );
}

export function useCodeQuestionRuntime(question: QuestionDocument) {
    const [code, setCode] = useState(question.starterCode || '');
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string>('');
    const { runPython, ready } = usePyodide();

    return {
        code,
        setCode,
        isRunning,
        setIsRunning,
        output,
        setOutput,
        runPython,
        ready,
    };
}

export function beginCodeExecution(
    disabled: boolean,
    ready: boolean,
    setIsRunning: (value: boolean) => void,
    setOutput: (value: string) => void,
) {
    if (disabled || !ready) {
        return false;
    }

    setIsRunning(true);
    setOutput('');
    return true;
}

export async function runCodeQuestionTests(
    runPython: (code: string, tests?: QuestionDocument['tests'], functionName?: string) => Promise<unknown>,
    code: string,
    question: QuestionDocument,
) {
    return runPython(code, question.tests, question.functionName);
}
