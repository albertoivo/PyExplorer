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
    parsons_problem: '🧩',
    turtle_challenge: '🎨',
    boss_battle: '👹',
};

const TYPE_LABELS: Record<string, string> = {
    multiple_choice: 'Escolha',
    true_false: 'V ou F',
    fill_code: 'Complete',
    partial_function: 'Função Parcial',
    full_function: 'Função',
    parsons_problem: 'Blocos',
    turtle_challenge: 'Arte Turtle',
    boss_battle: 'Chefe Final',
};

const STATUS_LABELS: Record<string, string> = {
    not_started: 'Não iniciado',
    in_progress: 'Em progresso',
    completed: 'Completo',
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
    const label = status !== 'completed' ? '0 de 3 estrelas' : `${stars} de 3 estrelas`;

    // Se não completou, mostra estrelas vazias
    if (status !== 'completed') {
        return (
            <span
                className="question-card__stars question-card__stars--potential"
                role="img"
                aria-label={label}
            >
                <span className="star star--empty" aria-hidden="true">☆</span>
                <span className="star star--empty" aria-hidden="true">☆</span>
                <span className="star star--empty" aria-hidden="true">☆</span>
            </span>
        );
    }

    // Se completou, mostra estrelas ganhas
    return (
        <span
            className="question-card__stars question-card__stars--earned"
            role="img"
            aria-label={label}
        >
            {[1, 2, 3].map(i => (
                <span key={i} className={`star ${i <= stars ? 'star--filled' : 'star--empty'}`} aria-hidden="true">
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

    // Construct comprehensive aria-label for the entire card button
    const statusLabel = locked ? 'Bloqueado' : (STATUS_LABELS[status] || 'Status desconhecido');
    const scoreLabel = status === 'completed' ? `${stars} de 3 estrelas` : '0 de 3 estrelas';
    const ariaLabel = `Questão ${index + 1}: ${question.title}. ${statusLabel}. ${!locked ? scoreLabel + '.' : ''} Tipo: ${typeLabel}.`;

    return (
        <button
            className={`question-card question-card--${status} ${locked ? 'question-card--locked' : ''}`}
            onClick={handleClick}
            disabled={locked}
            aria-label={ariaLabel}
        >
            <div className={`question-card__status question-card__status--${locked ? 'locked' : status}`} aria-hidden="true">
                {statusIcon}
            </div>

            <div className="question-card__content">
                <div className="question-card__header">
                    <span className="question-card__type">
                        <span aria-hidden="true">{typeIcon}</span> {typeLabel}
                    </span>
                    <StarsDisplay stars={stars} status={status} />
                </div>

                <h4 className="question-card__title">{question.title}</h4>

                <p className="question-card__preview">
                    {question.prompt.slice(0, 80)}
                    {question.prompt.length > 80 ? '...' : ''}
                </p>
            </div>

            <div className="question-card__arrow" aria-hidden="true">→</div>
        </button>
    );
});

