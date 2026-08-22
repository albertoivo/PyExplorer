import { useState } from 'react';
import type { QuestionDocument } from '../../../types/question';
import { QuestionHeader } from './QuestionTypeShared';
import { useTranslation } from 'react-i18next';
import './QuestionTypes.css';

interface TrueFalseQuestionProps {
    question: QuestionDocument;
    onAnswer: (isCorrect: boolean, selectedBool: boolean) => void;
    disabled?: boolean;
    showResult?: boolean;
    selectedAnswer?: boolean;
}

/**
 * Componente para questões de verdadeiro ou falso
 */
export function TrueFalseQuestion({
    question,
    onAnswer,
    disabled = false,
    showResult = false,
    selectedAnswer,
}: TrueFalseQuestionProps) {
    const { t } = useTranslation('game');
    const [selected, setSelected] = useState<boolean | null>(selectedAnswer ?? null);

    const handleSelect = (value: boolean) => {
        if (disabled) return;
        setSelected(value);
    };

    const handleSubmit = () => {
        if (selected === null || disabled) return;
        const isCorrect = selected === question.correctBool;
        onAnswer(isCorrect, selected);
    };

    const getButtonClass = (value: boolean) => {
        let className = 'tf-option';
        className += value ? ' tf-option--true' : ' tf-option--false';

        if (selected === value) {
            className += ' tf-option--selected';
        }

        if (showResult) {
            if (value === question.correctBool) {
                className += ' tf-option--correct';
            } else if (selected === value && value !== question.correctBool) {
                className += ' tf-option--incorrect';
            }
        }

        return className;
    };

    return (
        <div className="question-container">
            <QuestionHeader
                badgeClassName="question-type-badge--tf"
                badgeText={t('questionTypes.badgeTf', '⚡ Verdadeiro ou Falso')}
                difficulty={question.difficulty}
                title={question.title}
                prompt={question.prompt}
            />

            {question.starterCode && (
                <div className="question-code-block">
                    <pre><code>{question.starterCode}</code></pre>
                </div>
            )}

            <div className="tf-options">
                <button
                    className={getButtonClass(true)}
                    onClick={() => handleSelect(true)}
                    disabled={disabled}
                >
                    <span className="tf-option__icon">✓</span>
                    <span className="tf-option__text">{t('question.true', 'Verdadeiro')}</span>
                </button>

                <button
                    className={getButtonClass(false)}
                    onClick={() => handleSelect(false)}
                    disabled={disabled}
                >
                    <span className="tf-option__icon">✗</span>
                    <span className="tf-option__text">{t('question.false', 'Falso')}</span>
                </button>
            </div>

            {!showResult && (
                <button
                    className="question-submit-btn"
                    onClick={handleSubmit}
                    disabled={selected === null || disabled}
                >
                    {t('question.checkAnswer', 'Verificar Resposta 🚀')}
                </button>
            )}
        </div>
    );
}
