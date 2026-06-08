
import React, { useState } from 'react';
import type { QuestionDocument } from '../../../types/question';
import { usePyodide } from '../../../hooks/usePyodide';
import { QuestionHeader } from './QuestionTypeShared';
import './QuestionTypes.css';
import './ParsonsQuestion.css';

interface ParsonsQuestionProps {
    question: QuestionDocument;
    onAnswer: (isCorrect: boolean, code: string) => void;
    disabled?: boolean;
    showResult?: boolean;
}

interface CodeBlock {
    id: string;
    content: string;
    indentation: number; // 0, 1, 2... (multiplicado por 4 espaços)
}

export function ParsonsQuestion({
    question,
    onAnswer,
    disabled = false,
    showResult = false,
}: ParsonsQuestionProps) {
    const [blocks, setBlocks] = useState<CodeBlock[]>(() => {
        if (question.parsonsSegments) {
            const initialBlocks = question.parsonsSegments.map((seg, i) => ({
                id: `block-${i}`,
                content: seg.trim(),
                indentation: 0
            }));
            return [...initialBlocks].sort(() => Math.random() - 0.5);
        }
        return [];
    });

    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string>('');
    const { runPython, ready } = usePyodide();

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (disabled) return;
        e.dataTransfer.setData('text/plain', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault(); // Necessário para permitir drop
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        if (disabled) return;
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

        if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

        const newBlocks = [...blocks];
        const [movedBlock] = newBlocks.splice(sourceIndex, 1);
        newBlocks.splice(targetIndex, 0, movedBlock);

        setBlocks(newBlocks);
    };

    // Indentation handlers
    const changeIndentation = (index: number, delta: number) => {
        if (disabled) return;
        const newBlocks = [...blocks];
        const block = newBlocks[index];
        const newIndent = Math.max(0, Math.min(4, block.indentation + delta));

        if (newIndent !== block.indentation) {
            block.indentation = newIndent;
            setBlocks(newBlocks);
        }
    };

    // Submissão
    const handleSubmit = async () => {
        if (disabled || !ready) return;
        setIsRunning(true);
        setOutput('');

        // Reconstrói o código Python com indentação
        const assembledCode = blocks
            .map(b => '    '.repeat(b.indentation) + b.content)
            .join('\n');

        try {
            // Executa com testes
            const result = await runPython(assembledCode, question.tests);

            if (result.hasError) {
                setOutput(result.stderr);
                onAnswer(false, assembledCode);
            } else {
                const passed = result.allTestsPassed ?? true;
                if (!passed) {
                    setOutput(result.stdout || 'O código rodou, mas a resposta não está correta baseada nos testes.');
                }
                onAnswer(passed, assembledCode);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido';
            setOutput(`❌ Erro: ${message}`);
            onAnswer(false, assembledCode);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="question-container question-container--parsons">
            <QuestionHeader
                badgeClassName="question-type-badge--parsons"
                badgeText="🧩 Quebra-Cabeça de Código"
                difficulty={question.difficulty}
                title={question.title}
                prompt={question.prompt}
            />
            <p className="parsons-instructions">
                Arraste os blocos para colocar na ordem certa. Use as setas para ajustar a "margem" (indentação) de cada linha.
            </p>

            <div className="parsons-area">
                {blocks.map((block, index) => (
                    <div
                        key={block.id}
                        className={`parsons-block ${disabled ? 'parsons-block--disabled' : ''}`}
                        draggable={!disabled}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{ marginLeft: `${block.indentation * 30}px` }}
                    >
                        <div className="parsons-block__content">
                            <span className="parsons-block__drag-handle">☰</span>
                            <code>{block.content}</code>
                        </div>

                        {!disabled && (
                            <div className="parsons-block__controls">
                                <button
                                    onClick={() => changeIndentation(index, -1)}
                                    disabled={block.indentation === 0}
                                    title="Diminuir recuo"
                                >
                                    ◀
                                </button>
                                <button
                                    onClick={() => changeIndentation(index, 1)}
                                    disabled={block.indentation >= 4}
                                    title="Aumentar recuo"
                                >
                                    ▶
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {output && (
                <div className={`question-output ${showResult && !output.includes('Erro') ? 'question-output--success' : 'question-output--error'}`}>
                    <div className="question-output__header">Saída:</div>
                    <pre className="question-output__content">{output}</pre>
                </div>
            )}

            {!showResult && (
                <div className="question-actions">
                    <button
                        className="question-submit-btn"
                        onClick={handleSubmit}
                        disabled={disabled || !ready || isRunning}
                    >
                        {isRunning ? 'Verificando... ⏳' : 'Verificar Ordem ✨'}
                    </button>
                </div>
            )}
        </div>
    );
}

