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

function createShuffledBlocks(segments: string[]): CodeBlock[] {
    const initialBlocks = segments.map((seg: string, i: number) => ({
        id: `block-${i}`,
        content: seg.trim(),
        indentation: 0
    }));
    // Reverse/rotate to ensure blocks do not start already in the target solved order
    if (initialBlocks.length > 1) {
        return initialBlocks.slice(1).concat(initialBlocks.slice(0, 1));
    }
    return initialBlocks;
}

export function ParsonsQuestion({
    question,
    onAnswer,
    disabled = false,
    showResult = false,
}: ParsonsQuestionProps) {
    const [prevQuestionId, setPrevQuestionId] = useState(question.id);
    const [blocks, setBlocks] = useState<CodeBlock[]>(() =>
        createShuffledBlocks(question.parsonsSegments || [])
    );

    if (prevQuestionId !== question.id) {
        setPrevQuestionId(question.id);
        setBlocks(createShuffledBlocks(question.parsonsSegments || []));
    }

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

    // Move block up/down handler (essential for mobile touch)
    const moveBlock = (index: number, delta: number) => {
        if (disabled) return;
        const targetIndex = index + delta;
        if (targetIndex < 0 || targetIndex >= blocks.length) return;

        const newBlocks = [...blocks];
        const [movedBlock] = newBlocks.splice(index, 1);
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

        const codeToRun = question.starterCode
            ? `${question.starterCode}\n\n${assembledCode}`
            : assembledCode;

        try {
            // Executa com testes
            const result = await runPython(codeToRun, question.tests);

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
                Arraste ou use os botões <b>▲ ▼</b> para ordenar as linhas e <b>◀ ▶</b> para ajustar a margem (indentação).
            </p>

            <div className="parsons-area">
                {blocks.map((block, index) => (
                    <div
                        key={block.id}
                        className="parsons-block-wrapper"
                        style={{ paddingLeft: `${block.indentation * 24}px` }}
                        draggable={!disabled}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        {/* Botões de Indentação (Esquerda) */}
                        <div className="parsons-indent-controls">
                            <button
                                type="button"
                                className="parsons-btn parsons-btn--indent"
                                onClick={() => changeIndentation(index, -1)}
                                disabled={disabled || block.indentation === 0}
                                title="Diminuir indentação"
                                aria-label={`Diminuir indentação da linha ${index + 1}`}
                            >
                                ◀
                            </button>
                            <button
                                type="button"
                                className="parsons-btn parsons-btn--indent"
                                onClick={() => changeIndentation(index, 1)}
                                disabled={disabled || block.indentation >= 4}
                                title="Aumentar indentação"
                                aria-label={`Aumentar indentação da linha ${index + 1}`}
                            >
                                ▶
                            </button>
                        </div>

                        {/* Bloco de Código com Drag Handle */}
                        <div className="parsons-block">
                            <span className="parsons-drag-handle" title="Arraste para reordenar" aria-hidden="true">⋮⋮</span>
                            <code className="parsons-code">{block.content}</code>
                        </div>

                        {/* Botões de Reordenação Vertical (Direita - Mobile Friendly) */}
                        <div className="parsons-order-controls">
                            <button
                                type="button"
                                className="parsons-btn parsons-btn--order"
                                onClick={() => moveBlock(index, -1)}
                                disabled={disabled || index === 0}
                                title="Mover para cima"
                                aria-label={`Mover linha ${index + 1} para cima`}
                            >
                                ▲
                            </button>
                            <button
                                type="button"
                                className="parsons-btn parsons-btn--order"
                                onClick={() => moveBlock(index, 1)}
                                disabled={disabled || index === blocks.length - 1}
                                title="Mover para baixo"
                                aria-label={`Mover linha ${index + 1} para baixo`}
                            >
                                ▼
                            </button>
                        </div>
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
