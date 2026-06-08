import { useState } from 'react';
import type { QuestionDocument } from '../../../types/question';
import './QuestionTypes.css';

interface MultipleChoiceQuestionProps {
    question: QuestionDocument;
    onAnswer: (isCorrect: boolean, selectedIndex: number) => void;
    disabled?: boolean;
    showResult?: boolean;
    selectedAnswer?: number;
}

/**
 * Componente para questões de múltipla escolha
 */
export function MultipleChoiceQuestion({
    question,
    onAnswer,
    disabled = false,
    showResult = false,
    selectedAnswer,
}: MultipleChoiceQuestionProps) {
    const [selected, setSelected] = useState<number | null>(selectedAnswer ?? null);

    const handleSelect = (index: number) => {
        if (disabled) return;
        setSelected(index);
    };

    const handleSubmit = () => {
        if (selected === null || disabled) return;
        const isCorrect = selected === question.answerIndex;
        onAnswer(isCorrect, selected);
    };

    const getOptionClass = (index: number) => {
        let className = 'question-option';

        if (selected === index) {
            className += ' question-option--selected';
        }

        if (showResult) {
            if (index === question.answerIndex) {
                className += ' question-option--correct';
            } else if (selected === index && index !== question.answerIndex) {
                className += ' question-option--incorrect';
            }
        }

        return className;
    };

    return (
        <div className="question-container">
            <div className="question-header">
                <span className="question-type-badge question-type-badge--choice">
                    🎯 Escolha a resposta
                </span>
                <span className={`question-difficulty question-difficulty--${question.difficulty}`}>
                    {question.difficulty === 'easy' && '⭐ Fácil'}
                    {question.difficulty === 'medium' && '⭐⭐ Médio'}
                    {question.difficulty === 'hard' && '⭐⭐⭐ Difícil'}
                </span>
            </div>

            <h2 className="question-title">{question.title}</h2>
            <p className="question-prompt">{question.prompt}</p>

            <div className="question-options">
                {question.options?.map((option, index) => (
                    <button
                        key={index}
                        className={getOptionClass(index)}
                        onClick={() => handleSelect(index)}
                        disabled={disabled}
                    >
                        <span className="question-option__letter">
                            {String.fromCharCode(65 + index)}
                        </span>
                        <span className="question-option__text">{option}</span>
                        {showResult && index === question.answerIndex && (
                            <span className="question-option__icon">✓</span>
                        )}
                        {showResult && selected === index && index !== question.answerIndex && (
                            <span className="question-option__icon">✗</span>
                        )}
                    </button>
                ))}
            </div>

            {!showResult && (
                <button
                    className="question-submit-btn"
                    onClick={handleSubmit}
                    disabled={selected === null || disabled}
                >
                    Verificar Resposta 🚀
                </button>
            )}
        </div>
    );
}

