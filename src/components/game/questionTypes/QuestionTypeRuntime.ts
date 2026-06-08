import { useState } from 'react';
import type { QuestionDocument } from '../../../types/question';
import { usePyodide } from '../../../hooks/usePyodide';

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
