import { memo } from 'react';
import type { QuestionDocument } from '../../types/question';
import './QuestionCard.css';

interface QuestionCardProps {
    question: QuestionDocument;
    index: number;
    status: 'not_started' | 'in_progress' | 'completed';
    stars?: 0 | 1 | 2 | 3;
    locked?: boolean;
    onClick: (question: QuestionDocument) => void;
}

const TYPE_ICONS: Record<string, string> = {
    multiple_choice: '🎯',
    true_false: '⚡',
    fill_code: '✏️',
    partial_function: '🧩',
    full_function: '💻',
    boss_battle: '👹',
};

const TYPE_LABELS: Record<string, string> = {
    multiple_choice: 'Escolha',
    true_false: 'V ou F',
    fill_code: 'Complete',
    partial_function: 'Função Parcial',
    full_function: 'Função',
    boss_battle: 'Chefe Final',
};

const getStatusIcon = (status: string, locked?: boolean, index?: number) => {
    if (locked) return '🔒';
    switch (status) {
        case 'completed': return '✓';
        case 'in_progress': return '⋯';
        default: return index !== undefined ? index + 1 : '';
    }
};

/**
 * Renderiza estrelas ganhas (filled) vs potenciais (empty)
 */
const StarsDisplay = ({ stars, status }: { stars: number; status: string }) => {
    // Se não completou, mostra estrelas vazias
    if (status !== 'completed') {
        return (
            <span className="question-card__stars question-card__stars--potential">
                <span className="star star--empty">☆</span>
                <span className="star star--empty">☆</span>
                <span className="star star--empty">☆</span>
            </span>
        );
    }

    // Se completou, mostra estrelas ganhas
    return (
        <span className="question-card__stars question-card__stars--earned">
            {[1, 2, 3].map(i => (
                <span key={i} className={`star ${i <= stars ? 'star--filled' : 'star--empty'}`}>
                    {i <= stars ? '★' : '☆'}
                </span>
            ))}
        </span>
    );
};

/**
 * Card de questão na lista de questões de um mundo
 */
export const QuestionCard = memo(function QuestionCard({ question, index, status, stars = 0, locked, onClick }: QuestionCardProps) {
    const typeIcon = TYPE_ICONS[question.type] || '❓';
    const typeLabel = TYPE_LABELS[question.type] || 'Questão';
    const statusIcon = getStatusIcon(status, locked, index);

    const handleClick = () => {
        if (!locked) {
            onClick(question);
        }
    };

    return (
        <button
            className={`question-card question-card--${status} ${locked ? 'question-card--locked' : ''}`}
            onClick={handleClick}
            disabled={locked}
        >
            <div className={`question-card__status question-card__status--${locked ? 'locked' : status}`}>
                {statusIcon}
            </div>

            <div className="question-card__content">
                <div className="question-card__header">
                    <span className="question-card__type">
                        {typeIcon} {typeLabel}
                    </span>
                    <StarsDisplay stars={stars} status={status} />
                </div>

                <h4 className="question-card__title">{question.title}</h4>

                <p className="question-card__preview">
                    {question.prompt.slice(0, 80)}
                    {question.prompt.length > 80 ? '...' : ''}
                </p>
            </div>

            <div className="question-card__arrow">→</div>
        </button>
    );
});

export default QuestionCard;
