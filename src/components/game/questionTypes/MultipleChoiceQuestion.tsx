import { useState, useMemo } from 'react';
import type { QuestionDocument } from '../../../types/question';
import type { PowerUpType } from '../../../types/gamification';
import { QuestionHeader } from './QuestionTypeShared';
import { useTranslation } from 'react-i18next';
import './QuestionTypes.css';

interface MultipleChoiceQuestionProps {
    question: QuestionDocument;
    onAnswer: (isCorrect: boolean, selectedIndex: number) => void;
    disabled?: boolean;
    showResult?: boolean;
    selectedAnswer?: number;
    activePowerUp?: PowerUpType | null;
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
    activePowerUp,
}: MultipleChoiceQuestionProps) {
    const { t } = useTranslation('game');
    const [selected, setSelected] = useState<number | null>(selectedAnswer ?? null);

    const eliminatedIndices = useMemo(() => {
        if (activePowerUp !== 'fifty_fifty' || !question.options || question.options.length <= 2) {
            return new Set<number>();
        }
        const incorrectIndices: number[] = [];
        question.options.forEach((_, idx) => {
            if (idx !== question.answerIndex) {
                incorrectIndices.push(idx);
            }
        });
        // Deterministic hash based on question id to remain pure
        let seed = 0;
        const qId = question.id || '';
        for (let i = 0; i < qId.length; i++) {
            seed = (seed << 5) - seed + qId.charCodeAt(i);
            seed |= 0;
        }
        const shuffled = [...incorrectIndices].sort((a, b) => {
            const hashA = Math.abs((a * 2654435761 + seed) % 1000);
            const hashB = Math.abs((b * 2654435761 + seed) % 1000);
            return hashA - hashB;
        });
        const toEliminate = shuffled.slice(0, Math.min(2, incorrectIndices.length));
        return new Set(toEliminate);
    }, [activePowerUp, question.options, question.answerIndex, question.id]);

    const effectiveSelected = selected !== null && eliminatedIndices.has(selected) ? null : selected;

    const handleSelect = (index: number) => {
        if (disabled || eliminatedIndices.has(index)) return;
        setSelected(index);
    };

    const handleSubmit = () => {
        if (effectiveSelected === null || disabled) return;
        const isCorrect = effectiveSelected === question.answerIndex;
        onAnswer(isCorrect, effectiveSelected);
    };

    const getOptionClass = (index: number) => {
        let className = 'question-option';

        if (effectiveSelected === index) {
            className += ' question-option--selected';
        }

        if (eliminatedIndices.has(index)) {
            className += ' question-option--eliminated';
        }

        if (showResult) {
            if (index === question.answerIndex) {
                className += ' question-option--correct';
            } else if (effectiveSelected === index && index !== question.answerIndex) {
                className += ' question-option--incorrect';
            }
        }

        return className;
    };

    return (
        <div className="question-container">
            <QuestionHeader
                badgeClassName="question-type-badge--choice"
                badgeText={t('questionTypes.badgeChoice', '🎯 Escolha a resposta')}
                difficulty={question.difficulty}
                title={question.title}
                prompt={question.prompt}
            />

            <div className="question-options">
                {question.options?.map((option, index) => (
                    <button
                        key={index}
                        className={getOptionClass(index)}
                        onClick={() => handleSelect(index)}
                        disabled={disabled || eliminatedIndices.has(index)}
                    >
                        <span className="question-option__letter">
                            {String.fromCharCode(65 + index)}
                        </span>
                        <span className="question-option__text">{option}</span>
                        {showResult && index === question.answerIndex && (
                            <span className="question-option__icon">✓</span>
                        )}
                        {showResult && effectiveSelected === index && index !== question.answerIndex && (
                            <span className="question-option__icon">✗</span>
                        )}
                    </button>
                ))}
            </div>

            {!showResult && (
                <button
                    className="question-submit-btn"
                    onClick={handleSubmit}
                    disabled={effectiveSelected === null || disabled}
                >
                    {t('question.checkAnswer', 'Verificar Resposta 🚀')}
                </button>
            )}
        </div>
    );
}
